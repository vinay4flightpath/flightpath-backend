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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const userAccount = await this.prisma.userAccount.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: {
                person: {
                    include: {
                        memberships: {
                            where: { status: client_1.MembershipStatus.ACTIVE },
                            include: {
                                tenant: true,
                                roles: true,
                            },
                        },
                    },
                },
            },
        });
        if (!userAccount) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (!userAccount.isActive) {
            throw new common_1.UnauthorizedException('Your account is deactivated or your invitation has not been accepted yet.');
        }
        const isPasswordValid = await bcrypt.compare(password, userAccount.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.prisma.userAccount.update({
            where: { id: userAccount.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens({
            sub: userAccount.id,
            personId: userAccount.personId,
            email: userAccount.email,
            isSuperAdmin: userAccount.isSuperAdmin,
        });
        const formattedTenants = userAccount.person.memberships.map((m) => ({
            membershipId: m.id,
            tenantId: m.tenant.id,
            tenantName: m.tenant.name,
            tenantCode: m.tenant.code,
            status: m.status,
            roles: m.roles.map((r) => r.role),
        }));
        return {
            ...tokens,
            user: {
                id: userAccount.id,
                personId: userAccount.personId,
                email: userAccount.email,
                flightpathId: userAccount.person.flightpathId,
                firstName: userAccount.person.firstName,
                lastName: userAccount.person.lastName,
                isSuperAdmin: userAccount.isSuperAdmin,
            },
            tenants: formattedTenants,
        };
    }
    async getProfile(userAccountId) {
        const userAccount = await this.prisma.userAccount.findUnique({
            where: { id: userAccountId },
            include: {
                person: {
                    include: {
                        memberships: {
                            where: { status: client_1.MembershipStatus.ACTIVE },
                            include: {
                                tenant: true,
                                roles: true,
                            },
                        },
                    },
                },
            },
        });
        if (!userAccount) {
            throw new common_1.NotFoundException('User profile not found.');
        }
        const formattedTenants = userAccount.person.memberships.map((m) => ({
            membershipId: m.id,
            tenantId: m.tenant.id,
            tenantName: m.tenant.name,
            tenantCode: m.tenant.code,
            status: m.status,
            roles: m.roles.map((r) => r.role),
        }));
        return {
            user: {
                id: userAccount.id,
                personId: userAccount.personId,
                email: userAccount.email,
                flightpathId: userAccount.person.flightpathId,
                firstName: userAccount.person.firstName,
                lastName: userAccount.person.lastName,
                isSuperAdmin: userAccount.isSuperAdmin,
            },
            tenants: formattedTenants,
        };
    }
    async acceptInvite(acceptInviteDto) {
        const { token, password } = acceptInviteDto;
        const userAccount = await this.prisma.userAccount.findUnique({
            where: { inviteToken: token },
            include: {
                person: true,
            },
        });
        if (!userAccount) {
            throw new common_1.BadRequestException('Invalid or expired invitation token.');
        }
        if (userAccount.inviteExpiresAt &&
            userAccount.inviteExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Invitation token has expired. Please ask an administrator to resend.');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const updatedAccount = await this.prisma.userAccount.update({
            where: { id: userAccount.id },
            data: {
                passwordHash,
                inviteToken: null,
                inviteExpiresAt: null,
                isActive: true,
                person: {
                    update: {
                        status: client_1.PersonStatus.ACTIVE,
                    },
                },
            },
            include: {
                person: {
                    include: {
                        memberships: {
                            include: {
                                tenant: true,
                                roles: true,
                            },
                        },
                    },
                },
            },
        });
        const tokens = await this.generateTokens({
            sub: updatedAccount.id,
            personId: updatedAccount.personId,
            email: updatedAccount.email,
            isSuperAdmin: updatedAccount.isSuperAdmin,
        });
        return {
            message: 'Account activated successfully.',
            ...tokens,
            user: {
                id: updatedAccount.id,
                personId: updatedAccount.personId,
                email: updatedAccount.email,
                flightpathId: updatedAccount.person.flightpathId,
                firstName: updatedAccount.person.firstName,
                lastName: updatedAccount.person.lastName,
                isSuperAdmin: updatedAccount.isSuperAdmin,
            },
        };
    }
    async refreshToken(refreshTokenString) {
        try {
            const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') ||
                'flightpath-development-refresh-secret-2026';
            const payload = this.jwtService.verify(refreshTokenString, {
                secret: refreshSecret,
            });
            const userAccount = await this.prisma.userAccount.findUnique({
                where: { id: payload.sub },
                include: { person: true },
            });
            if (!userAccount || !userAccount.isActive) {
                throw new common_1.UnauthorizedException('User account is invalid or inactive.');
            }
            return this.generateTokens({
                sub: userAccount.id,
                personId: userAccount.personId,
                email: userAccount.email,
                isSuperAdmin: userAccount.isSuperAdmin,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
    }
    async generateTokens(payload) {
        const accessSecret = this.configService.get('JWT_SECRET') ||
            'flightpath-development-super-secret-key-2026';
        const accessExpiresIn = this.configService.get('JWT_EXPIRES_IN') || '15m';
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') ||
            'flightpath-development-refresh-secret-2026';
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: accessSecret,
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(payload, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map