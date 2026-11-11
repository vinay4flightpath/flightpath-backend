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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const super_admin_guard_1 = require("../common/guards/super-admin.guard");
const tenant_admin_guard_1 = require("../common/guards/tenant-admin.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async create(createTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }
    async findAll(user) {
        return this.tenantsService.findAll(user);
    }
    async findById(id) {
        return this.tenantsService.findById(id);
    }
    async update(id, updateTenantDto) {
        return this.tenantsService.update(id, updateTenantDto);
    }
    async getMembers(tenantId) {
        return this.tenantsService.getMembers(tenantId);
    }
    async addExistingMember(tenantId, dto) {
        return this.tenantsService.addExistingMember(tenantId, dto);
    }
    async quickCreateMember(tenantId, dto) {
        return this.tenantsService.quickCreateMember(tenantId, dto);
    }
    async updateMemberRoles(tenantId, memberId, dto) {
        return this.tenantsService.updateMemberRoles(tenantId, memberId, dto);
    }
    async removeMember(tenantId, memberId) {
        return this.tenantsService.removeMember(tenantId, memberId);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant (SuperAdmin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tenants (All for SuperAdmin, accessible ones for Tenant users)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant details (SuperAdmin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_tenant_dto_1.UpdateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':tenantId/members'),
    (0, common_1.UseGuards)(tenant_admin_guard_1.TenantAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List all members under this tenant with their assigned roles' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(':tenantId/members'),
    (0, common_1.UseGuards)(tenant_admin_guard_1.TenantAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add an existing Person into this tenant with selected roles' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_member_dto_1.AddExistingMemberDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "addExistingMember", null);
__decorate([
    (0, common_1.Post)(':tenantId/members/quick-create'),
    (0, common_1.UseGuards)(tenant_admin_guard_1.TenantAdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'On-the-fly: Add person to tenant. If exists, links them; if new, creates Person + adds to tenant',
    }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_member_dto_1.QuickCreateMemberDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "quickCreateMember", null);
__decorate([
    (0, common_1.Put)(':tenantId/members/:memberId/roles'),
    (0, common_1.UseGuards)(tenant_admin_guard_1.TenantAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update the assigned roles for a tenant member' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_member_dto_1.UpdateMemberRolesDto]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateMemberRoles", null);
__decorate([
    (0, common_1.Delete)(':tenantId/members/:memberId'),
    (0, common_1.UseGuards)(tenant_admin_guard_1.TenantAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from this tenant (preserves Person entity in platform)' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "removeMember", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map