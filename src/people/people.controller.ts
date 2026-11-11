import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto, SearchPeopleDto } from './dto/search-people.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';

@ApiTags('People')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create a standalone Person without roles or tenants (SuperAdmin only)' })
  async create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list all people across the system (SuperAdmin & Tenant Admins)' })
  async findAll(@Query() query: SearchPeopleDto) {
    return this.peopleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person details by ID with memberships and roles' })
  async findById(@Param('id') id: string) {
    return this.peopleService.findById(id);
  }

  @Put(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update person details (SuperAdmin only)' })
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.peopleService.update(id, updatePersonDto);
  }

  @Post(':id/invite')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Generate or resend an invitation link for a person' })
  async generateInvite(@Param('id') id: string) {
    return this.peopleService.generateInvite(id);
  }
}
