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
exports.UpdateTenantDto = exports.CreateTenantDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateTenantDto {
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Flight Academy International', description: 'Name of the tenant' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'FAI-01',
        description: 'Unique alphanumeric identifier code for tenant (e.g. FAI-01)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[A-Z0-9_-]+$/i, {
        message: 'Tenant code must contain only letters, numbers, hyphens, and underscores',
    }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TenantStatus, default: client_1.TenantStatus.ACTIVE }),
    (0, class_validator_1.IsEnum)(client_1.TenantStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "status", void 0);
class UpdateTenantDto {
}
exports.UpdateTenantDto = UpdateTenantDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Flight Academy International' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTenantDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TenantStatus }),
    (0, class_validator_1.IsEnum)(client_1.TenantStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTenantDto.prototype, "status", void 0);
//# sourceMappingURL=create-tenant.dto.js.map