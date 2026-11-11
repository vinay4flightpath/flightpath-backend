import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { FlightpathIdGenerator } from '../common/utils/flightpath-id.generator';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import {
  AddExistingMemberDto,
  QuickCreateMemberDto,
  UpdateMemberRolesDto,
} from './dto/add-member.dto';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { MembershipStatus, PersonStatus, TenantRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: FlightpathIdGenerator,
  ) {}

  async create(dto: CreateTenantDto) {
    const normalizedCode = dto.code.toUpperCase().trim();

    const existing = await this.prisma.tenant.findUnique({
      where: { code: normalizedCode },
    });
    if (existing) {
      throw new ConflictException(
        `A tenant with code '${normalizedCode}' already exists.`,
      );
    }

    return this.prisma.tenant.create({
      data: {
        name: dto.name.trim(),
        code: normalizedCode,
        status: dto.status,
      },
    });
  }

  async findAll(currentUser: AuthenticatedUser) {
    if (currentUser.isSuperAdmin) {
      const tenants = await this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { memberships: true },
          },
          memberships: {
            include: {
              roles: true,
            },
          },
        },
      });

      return tenants.map((t) => {
        let adminCount = 0;
        let instructorCount = 0;
        let studentCount = 0;

        for (const m of t.memberships) {
          for (const r of m.roles) {
            if (r.role === TenantRole.ADMIN) adminCount++;
            if (r.role === TenantRole.INSTRUCTOR) instructorCount++;
            if (r.role === TenantRole.STUDENT) studentCount++;
          }
        }

        return {
          id: t.id,
          name: t.name,
          code: t.code,
          status: t.status,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          totalMembers: t._count.memberships,
          adminCount,
          instructorCount,
          studentCount,
        };
      });
    }

    // For non-SuperAdmin, return tenants where user is an active member
    const userMemberships = await this.prisma.tenantMembership.findMany({
      where: {
        personId: currentUser.personId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        tenant: true,
        roles: true,
      },
    });

    return userMemberships.map((m) => ({
      id: m.tenant.id,
      name: m.tenant.name,
      code: m.tenant.code,
      status: m.tenant.status,
      createdAt: m.tenant.createdAt,
      membershipId: m.id,
      roles: m.roles.map((r) => r.role),
    }));
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' was not found.`);
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);

    return this.prisma.tenant.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        status: dto.status,
      },
    });
  }

  async getMembers(tenantId: string) {
    await this.findById(tenantId);

    const memberships = await this.prisma.tenantMembership.findMany({
      where: { tenantId },
      orderBy: { joinedAt: 'desc' },
      include: {
        person: {
          include: {
            userAccount: {
              select: {
                id: true,
                isActive: true,
                inviteToken: true,
                lastLoginAt: true,
              },
            },
          },
        },
        roles: true,
      },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      tenantId: m.tenantId,
      status: m.status,
      joinedAt: m.joinedAt,
      roles: m.roles.map((r) => r.role),
      person: {
        id: m.person.id,
        flightpathId: m.person.flightpathId,
        firstName: m.person.firstName,
        lastName: m.person.lastName,
        email: m.person.email,
        phone: m.person.phone,
        status: m.person.status,
        userAccount: m.person.userAccount,
      },
    }));
  }

  async addExistingMember(tenantId: string, dto: AddExistingMemberDto) {
    await this.findById(tenantId);

    const person = await this.prisma.person.findUnique({
      where: { id: dto.personId },
    });
    if (!person) {
      throw new NotFoundException(
        `Person with ID '${dto.personId}' does not exist in the system.`,
      );
    }

    // Check if membership already exists
    let membership = await this.prisma.tenantMembership.findUnique({
      where: {
        personId_tenantId: {
          personId: person.id,
          tenantId,
        },
      },
      include: { roles: true },
    });

    if (membership) {
      if (membership.status !== MembershipStatus.ACTIVE) {
        await this.prisma.tenantMembership.update({
          where: { id: membership.id },
          data: { status: MembershipStatus.ACTIVE },
        });
      }

      // Sync roles
      await this.prisma.tenantMemberRole.deleteMany({
        where: { tenantMembershipId: membership.id },
      });

      const membershipId = membership.id;
      await this.prisma.tenantMemberRole.createMany({
        data: dto.roles.map((role) => ({
          tenantMembershipId: membershipId,
          role,
        })),
      });
    } else {
      membership = await this.prisma.tenantMembership.create({
        data: {
          personId: person.id,
          tenantId,
          status: MembershipStatus.ACTIVE,
          roles: {
            create: dto.roles.map((role) => ({ role })),
          },
        },
        include: { roles: true },
      });
    }

    return this.prisma.tenantMembership.findUnique({
      where: { id: membership.id },
      include: {
        person: true,
        roles: true,
      },
    });
  }

  async quickCreateMember(tenantId: string, dto: QuickCreateMemberDto) {
    await this.findById(tenantId);

    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check if person already exists globally
    let person = await this.prisma.person.findUnique({
      where: { email: normalizedEmail },
    });

    let isNewPerson = false;
    let inviteToken: string | null = null;

    if (!person) {
      isNewPerson = true;
      const flightpathId = await this.idGenerator.generateNextId();

      inviteToken = dto.sendInvite
        ? crypto.randomBytes(32).toString('hex')
        : null;
      const inviteExpiresAt = dto.sendInvite
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null;

      const tempPasswordHash = await bcrypt.hash(
        crypto.randomBytes(16).toString('hex'),
        10,
      );

      person = await this.prisma.person.create({
        data: {
          flightpathId,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: normalizedEmail,
          phone: dto.phone?.trim(),
          status: dto.sendInvite ? PersonStatus.INVITED : PersonStatus.ACTIVE,
          userAccount: {
            create: {
              email: normalizedEmail,
              passwordHash: tempPasswordHash,
              isSuperAdmin: false,
              isActive: !dto.sendInvite,
              inviteToken,
              inviteExpiresAt,
            },
          },
        },
      });
    }

    // Add person to tenant with roles
    const membership = await this.addExistingMember(tenantId, {
      personId: person.id,
      roles: dto.roles,
    });

    return {
      message: isNewPerson
        ? 'Person created on-the-fly and added to tenant.'
        : 'Existing person was found and added to tenant with selected roles.',
      isNewPerson,
      inviteUrl: inviteToken ? `/accept-invite?token=${inviteToken}` : null,
      membership,
    };
  }

  async updateMemberRoles(
    tenantId: string,
    memberId: string,
    dto: UpdateMemberRolesDto,
  ) {
    const membership = await this.prisma.tenantMembership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException(
        `Membership record '${memberId}' does not belong to this tenant.`,
      );
    }

    // Replace roles in a transaction
    await this.prisma.$transaction([
      this.prisma.tenantMemberRole.deleteMany({
        where: { tenantMembershipId: memberId },
      }),
      this.prisma.tenantMemberRole.createMany({
        data: dto.roles.map((role) => ({
          tenantMembershipId: memberId,
          role,
        })),
      }),
    ]);

    return this.prisma.tenantMembership.findUnique({
      where: { id: memberId },
      include: {
        person: true,
        roles: true,
      },
    });
  }

  async removeMember(tenantId: string, memberId: string) {
    const membership = await this.prisma.tenantMembership.findUnique({
      where: { id: memberId },
    });

    if (!membership || membership.tenantId !== tenantId) {
      throw new NotFoundException(
        `Membership record '${memberId}' does not belong to this tenant.`,
      );
    }

    // Delete membership and roles (preserves Person in the system)
    await this.prisma.tenantMembership.delete({
      where: { id: memberId },
    });

    return {
      message: 'Member removed from tenant successfully.',
    };
  }
}
