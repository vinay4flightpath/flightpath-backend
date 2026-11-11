import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/create-tenant.dto';
import {
  AddExistingMemberDto,
  QuickCreateMemberDto,
  UpdateMemberRolesDto,
} from './dto/add-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { TenantAdminGuard } from '../common/guards/tenant-admin.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a new tenant (SuperAdmin only)' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tenants (All for SuperAdmin, accessible ones for Tenant users)' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant details by ID' })
  async findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update tenant details (SuperAdmin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Get(':tenantId/members')
  @UseGuards(TenantAdminGuard)
  @ApiOperation({ summary: 'List all members under this tenant with their assigned roles' })
  async getMembers(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getMembers(tenantId);
  }

  @Post(':tenantId/members')
  @UseGuards(TenantAdminGuard)
  @ApiOperation({ summary: 'Add an existing Person into this tenant with selected roles' })
  async addExistingMember(
    @Param('tenantId') tenantId: string,
    @Body() dto: AddExistingMemberDto,
  ) {
    return this.tenantsService.addExistingMember(tenantId, dto);
  }

  @Post(':tenantId/members/quick-create')
  @UseGuards(TenantAdminGuard)
  @ApiOperation({
    summary:
      'On-the-fly: Add person to tenant. If exists, links them; if new, creates Person + adds to tenant',
  })
  async quickCreateMember(
    @Param('tenantId') tenantId: string,
    @Body() dto: QuickCreateMemberDto,
  ) {
    return this.tenantsService.quickCreateMember(tenantId, dto);
  }

  @Put(':tenantId/members/:memberId/roles')
  @UseGuards(TenantAdminGuard)
  @ApiOperation({ summary: 'Update the assigned roles for a tenant member' })
  async updateMemberRoles(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRolesDto,
  ) {
    return this.tenantsService.updateMemberRoles(tenantId, memberId, dto);
  }

  @Delete(':tenantId/members/:memberId')
  @UseGuards(TenantAdminGuard)
  @ApiOperation({ summary: 'Remove a member from this tenant (preserves Person entity in platform)' })
  async removeMember(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.tenantsService.removeMember(tenantId, memberId);
  }
}
