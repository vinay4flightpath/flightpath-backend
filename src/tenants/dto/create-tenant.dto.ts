import { IsNotEmpty, IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({ example: 'Flight Academy International', description: 'Name of the tenant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'FAI-01',
    description: 'Unique alphanumeric identifier code for tenant (e.g. FAI-01)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/i, {
    message: 'Tenant code must contain only letters, numbers, hyphens, and underscores',
  })
  code: string;

  @ApiPropertyOptional({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Flight Academy International' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
