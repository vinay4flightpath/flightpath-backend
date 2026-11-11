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
exports.PeopleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const people_service_1 = require("./people.service");
const create_person_dto_1 = require("./dto/create-person.dto");
const search_people_dto_1 = require("./dto/search-people.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const super_admin_guard_1 = require("../common/guards/super-admin.guard");
let PeopleController = class PeopleController {
    constructor(peopleService) {
        this.peopleService = peopleService;
    }
    async create(createPersonDto) {
        return this.peopleService.create(createPersonDto);
    }
    async findAll(query) {
        return this.peopleService.findAll(query);
    }
    async findById(id) {
        return this.peopleService.findById(id);
    }
    async update(id, updatePersonDto) {
        return this.peopleService.update(id, updatePersonDto);
    }
    async generateInvite(id) {
        return this.peopleService.generateInvite(id);
    }
};
exports.PeopleController = PeopleController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a standalone Person without roles or tenants (SuperAdmin only)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_person_dto_1.CreatePersonDto]),
    __metadata("design:returntype", Promise)
], PeopleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search and list all people across the system (SuperAdmin & Tenant Admins)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_people_dto_1.SearchPeopleDto]),
    __metadata("design:returntype", Promise)
], PeopleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get person details by ID with memberships and roles' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeopleController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update person details (SuperAdmin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, search_people_dto_1.UpdatePersonDto]),
    __metadata("design:returntype", Promise)
], PeopleController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Generate or resend an invitation link for a person' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeopleController.prototype, "generateInvite", null);
exports.PeopleController = PeopleController = __decorate([
    (0, swagger_1.ApiTags)('People'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('people'),
    __metadata("design:paramtypes", [people_service_1.PeopleService])
], PeopleController);
//# sourceMappingURL=people.controller.js.map