import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantRole } from '@prisma/client';

export class AddExistingMemberDto {
  @ApiProperty({
    example: 'uuid-person-id',
    description: 'Existing Person ID to add under this tenant',
  })
  @IsString()
  @IsNotEmpty()
  personId: string;

  @ApiProperty({
    example: ['ADMIN'],
    enum: TenantRole,
    isArray: true,
    description: 'One or more roles to assign (ADMIN, INSTRUCTOR, STUDENT)',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be selected.' })
  @IsEnum(TenantRole, { each: true })
  roles: TenantRole[];
}

export class QuickCreateMemberDto {
  @ApiProperty({ example: 'Captain Alex', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Mercer', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'alex.mercer@flightacademy.com', description: 'Email address' })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1 555-0199', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: ['INSTRUCTOR'],
    enum: TenantRole,
    isArray: true,
    description: 'Roles to assign to this member within the tenant',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be selected.' })
  @IsEnum(TenantRole, { each: true })
  roles: TenantRole[];

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether to send an activation invite token',
  })
  @IsOptional()
  sendInvite?: boolean = true;
}

export class UpdateMemberRolesDto {
  @ApiProperty({
    example: ['INSTRUCTOR', 'STUDENT'],
    enum: TenantRole,
    isArray: true,
    description: 'Updated list of roles for this tenant member',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be assigned.' })
  @IsEnum(TenantRole, { each: true })
  roles: TenantRole[];
}
