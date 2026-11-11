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
exports.UpdateMemberRolesDto = exports.QuickCreateMemberDto = exports.AddExistingMemberDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AddExistingMemberDto {
}
exports.AddExistingMemberDto = AddExistingMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'uuid-person-id',
        description: 'Existing Person ID to add under this tenant',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddExistingMemberDto.prototype, "personId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['ADMIN'],
        enum: client_1.TenantRole,
        isArray: true,
        description: 'One or more roles to assign (ADMIN, INSTRUCTOR, STUDENT)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one role must be selected.' }),
    (0, class_validator_1.IsEnum)(client_1.TenantRole, { each: true }),
    __metadata("design:type", Array)
], AddExistingMemberDto.prototype, "roles", void 0);
class QuickCreateMemberDto {
    constructor() {
        this.sendInvite = true;
    }
}
exports.QuickCreateMemberDto = QuickCreateMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Captain Alex', description: 'First name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuickCreateMemberDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mercer', description: 'Last name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuickCreateMemberDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'alex.mercer@flightacademy.com', description: 'Email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuickCreateMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1 555-0199', description: 'Phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuickCreateMemberDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['INSTRUCTOR'],
        enum: client_1.TenantRole,
        isArray: true,
        description: 'Roles to assign to this member within the tenant',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one role must be selected.' }),
    (0, class_validator_1.IsEnum)(client_1.TenantRole, { each: true }),
    __metadata("design:type", Array)
], QuickCreateMemberDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: true,
        default: true,
        description: 'Whether to send an activation invite token',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QuickCreateMemberDto.prototype, "sendInvite", void 0);
class UpdateMemberRolesDto {
}
exports.UpdateMemberRolesDto = UpdateMemberRolesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['INSTRUCTOR', 'STUDENT'],
        enum: client_1.TenantRole,
        isArray: true,
        description: 'Updated list of roles for this tenant member',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one role must be assigned.' }),
    (0, class_validator_1.IsEnum)(client_1.TenantRole, { each: true }),
    __metadata("design:type", Array)
], UpdateMemberRolesDto.prototype, "roles", void 0);
//# sourceMappingURL=add-member.dto.js.map