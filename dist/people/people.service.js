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
exports.PeopleService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const flightpath_id_generator_1 = require("../common/utils/flightpath-id.generator");
const client_1 = require("@prisma/client");
let PeopleService = class PeopleService {
    constructor(prisma, idGenerator) {
        this.prisma = prisma;
        this.idGenerator = idGenerator;
    }
    async create(dto) {
        const normalizedEmail = dto.email.toLowerCase().trim();
        const existingPerson = await this.prisma.person.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingPerson) {
            throw new common_1.ConflictException(`A person with email '${normalizedEmail}' already exists in the system (Flightpath ID: ${existingPerson.flightpathId}).`);
        }
        const flightpathId = await this.idGenerator.generateNextId();
        const inviteToken = dto.sendInvite
            ? crypto.randomBytes(32).toString('hex')
            : null;
        const inviteExpiresAt = dto.sendInvite
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : null;
        const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        const person = await this.prisma.person.create({
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
    async findAll(query) {
        const { search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findById(id) {
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
            throw new common_1.NotFoundException(`Person with ID '${id}' was not found.`);
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
    async update(id, dto) {
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
    async generateInvite(id) {
        const person = await this.findById(id);
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const userAccount = await this.prisma.userAccount.upsert({
            where: { personId: person.id },
            create: {
                personId: person.id,
                email: person.email,
                passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
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
            data: { status: client_1.PersonStatus.INVITED },
        });
        return {
            message: 'Invitation link generated successfully.',
            inviteToken,
            inviteExpiresAt,
            inviteUrl: `/accept-invite?token=${inviteToken}`,
        };
    }
};
exports.PeopleService = PeopleService;
exports.PeopleService = PeopleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        flightpath_id_generator_1.FlightpathIdGenerator])
], PeopleService);
//# sourceMappingURL=people.service.js.map