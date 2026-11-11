import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { FlightpathIdGenerator } from '../common/utils/flightpath-id.generator';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto, SearchPeopleDto } from './dto/search-people.dto';
import { PersonStatus, Prisma } from '@prisma/client';

@Injectable()
export class PeopleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idGenerator: FlightpathIdGenerator,
  ) {}

  async create(dto: CreatePersonDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check if email already exists
    const existingPerson = await this.prisma.person.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingPerson) {
      throw new ConflictException(
        `A person with email '${normalizedEmail}' already exists in the system (Flightpath ID: ${existingPerson.flightpathId}).`,
      );
    }

    const flightpathId = await this.idGenerator.generateNextId();

    const inviteToken = dto.sendInvite
      ? crypto.randomBytes(32).toString('hex')
      : null;
    const inviteExpiresAt = dto.sendInvite
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null;

    // Default temporary hashed password until invite is accepted
    const tempPasswordHash = await bcrypt.hash(
      crypto.randomBytes(16).toString('hex'),
      10,
    );

    const person = await this.prisma.person.create({
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
            isActive: !dto.sendInvite, // active immediately if not waiting for invite
            inviteToken,
            inviteExpiresAt,
          },
        },
      },
      include: {
        userAccount: {
          select: {
            id: true,
            isSuperAdmin: true,
            isActive: true,
            inviteToken: true,
            inviteExpiresAt: true,
            lastLoginAt: true,
          },
        },
      },
    });

    return {
      ...person,
      inviteUrl: inviteToken
        ? `/accept-invite?token=${inviteToken}`
        : null,
    };
  }

  async findAll(query: SearchPeopleDto) {
    const { search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PersonWhereInput = {};

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { flightpathId: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.person.count({ where }),
      this.prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userAccount: {
            select: {
              id: true,
              isSuperAdmin: true,
              isActive: true,
              inviteToken: true,
              lastLoginAt: true,
            },
          },
          memberships: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: data.map((p) => ({
        id: p.id,
        flightpathId: p.flightpathId,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        status: p.status,
        createdAt: p.createdAt,
        userAccount: p.userAccount,
        memberships: p.memberships.map((m) => ({
          tenantId: m.tenant.id,
          tenantName: m.tenant.name,
          tenantCode: m.tenant.code,
          roles: m.roles.map((r) => r.role),
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        userAccount: {
          select: {
            id: true,
            isSuperAdmin: true,
            isActive: true,
            inviteToken: true,
            inviteExpiresAt: true,
            lastLoginAt: true,
          },
        },
        memberships: {
          include: {
            tenant: true,
            roles: true,
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID '${id}' was not found.`);
    }

    return {
      ...person,
      memberships: person.memberships.map((m) => ({
        membershipId: m.id,
        tenantId: m.tenant.id,
        tenantName: m.tenant.name,
        tenantCode: m.tenant.code,
        status: m.status,
        roles: m.roles.map((r) => r.role),
      })),
    };
  }

  async update(id: string, dto: UpdatePersonDto) {
    await this.findById(id);

    return this.prisma.person.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        phone: dto.phone?.trim(),
        status: dto.status,
      },
      include: {
        userAccount: true,
      },
    });
  }

  async generateInvite(id: string) {
    const person = await this.findById(id);

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const userAccount = await this.prisma.userAccount.upsert({
      where: { personId: person.id },
      create: {
        personId: person.id,
        email: person.email,
        passwordHash: await bcrypt.hash(
          crypto.randomBytes(16).toString('hex'),
          10,
        ),
        isSuperAdmin: false,
        isActive: false,
        inviteToken,
        inviteExpiresAt,
      },
      update: {
        inviteToken,
        inviteExpiresAt,
        isActive: false,
      },
    });

    await this.prisma.person.update({
      where: { id: person.id },
      data: { status: PersonStatus.INVITED },
    });

    return {
      message: 'Invitation link generated successfully.',
      inviteToken,
      inviteExpiresAt,
      inviteUrl: `/accept-invite?token=${inviteToken}`,
    };
  }
}
