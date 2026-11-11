"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const flightpath_id_generator_1 = require("../common/utils/flightpath-id.generator");
const client_1 = require("@prisma/client");
let TenantsService = class TenantsService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async create(dto) {
        const normalizedCode = dto.code.toUpperCase().trim();
        const existing = await this.prisma.tenant.findUnique({
            where: { code: normalizedCode },
        });
        if (existing) {
            throw new common_1.ConflictException(`A tenant with code '${normalizedCode}' already exists.`);
        }
        return this.prisma.tenant.create({
            data: {
                name: dto.name.trim(),
                code: normalizedCode,
                status: dto.status,
            },
        });
    }
    async findAll(currentUser) {
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
                        if (r.role === client_1.TenantRole.ADMIN)
                            adminCount++;
                        if (r.role === client_1.TenantRole.INSTRUCTOR)
                            instructorCount++;
                        if (r.role === client_1.TenantRole.STUDENT)
                            studentCount++;
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
        const userMemberships = await this.prisma.tenantMembership.findMany({
            where: {
                personId: currentUser.personId,
                status: client_1.MembershipStatus.ACTIVE,
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
    async findById(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { memberships: true },
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        return tenant;
    }
    async update(id, dto) {
        await this.findById(id);
        return this.prisma.tenant.update({
            where: { id },
            data: {
                name: dto.name?.trim(),
                status: dto.status,
            },
        });
    }
    async getMembers(tenantId) {
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
    async addExistingMember(tenantId, dto) {
        await this.findById(tenantId);
        const person = await this.prisma.person.findUnique({
            where: { id: dto.personId },
        });
        if (!person) {
            throw new common_1.NotFoundException(`Person with ID '${dto.personId}' does not exist in the system.`);
        }
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
            if (membership.status !== client_1.MembershipStatus.ACTIVE) {
                await this.prisma.tenantMembership.update({
                    where: { id: membership.id },
                    data: { status: client_1.MembershipStatus.ACTIVE },
                });
            }
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
        }
        else {
            membership = await this.prisma.tenantMembership.create({
                data: {
                    personId: person.id,
                    tenantId,
                    status: client_1.MembershipStatus.ACTIVE,
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
    async quickCreateMember(tenantId, dto) {
        await this.findById(tenantId);
        const normalizedEmail = dto.email.toLowerCase().trim();
        let person = await this.prisma.person.findUnique({
            where: { email: normalizedEmail },
        });
        let isNewPerson = false;
        let inviteToken = null;
        if (!person) {
            isNewPerson = true;
            const flightpathId = await this.idGenerator.generateNextId();
            inviteToken = dto.sendInvite
                ? crypto.randomBytes(32).toString('hex')
                : null;
            const inviteExpiresAt = dto.sendInvite
                ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                : null;
            const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
            person = await this.prisma.person.create({
                data: {
                    flightpathId,
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    email: normalizedEmail,
                    phone: dto.phone?.trim(),
                    status: dto.sendInvite ? client_1.PersonStatus.INVITED : client_1.PersonStatus.ACTIVE,
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
    async updateMemberRoles(tenantId, memberId, dto) {
        const membership = await this.prisma.tenantMembership.findUnique({
            where: { id: memberId },
        });
        if (!membership || membership.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Membership record '${memberId}' does not belong to this tenant.`);
        }
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
    async removeMember(tenantId, memberId) {
        const membership = await this.prisma.tenantMembership.findUnique({
            where: { id: memberId },
        });
        if (!membership || membership.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Membership record '${memberId}' does not belong to this tenant.`);
        }
        await this.prisma.tenantMembership.delete({
            where: { id: memberId },
        });
        return {
            message: 'Member removed from tenant successfully.',
        };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        flightpath_id_generator_1.FlightpathIdGenerator])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map