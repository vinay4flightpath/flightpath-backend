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
exports.TenantAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TenantAdminGuard = class TenantAdminGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User is not authenticated.');
        }
        if (user.isSuperAdmin) {
            return true;
        }
        const tenantId = request.params.tenantId ||
            request.params.id ||
            request.headers['x-tenant-id'];
        if (!tenantId) {
            throw new common_1.BadRequestException('Target tenant ID was not specified.');
        }
        const membership = await this.prisma.tenantMembership.findUnique({
            where: {
                personId_tenantId: {
                    personId: user.personId,
                    tenantId: tenantId,
                },
            },
            include: {
                roles: true,
            },
        });
        if (!membership || membership.status !== client_1.MembershipStatus.ACTIVE) {
            throw new common_1.ForbiddenException('You are not an active member of this tenant.');
        }
        const hasAdminRole = membership.roles.some((r) => r.role === client_1.TenantRole.ADMIN);
        if (!hasAdminRole) {
            throw new common_1.ForbiddenException('Tenant Admin privileges required for this operation.');
        }
        request.tenantMembership = membership;
        return true;
    }
};
exports.TenantAdminGuard = TenantAdminGuard;
exports.TenantAdminGuard = TenantAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantAdminGuard);
//# sourceMappingURL=tenant-admin.guard.js.map