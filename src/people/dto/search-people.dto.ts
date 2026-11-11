import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PersonStatus } from '@prisma/client';

export class UpdatePersonDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1 (555) 019-2834' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: PersonStatus })
  @IsEnum(PersonStatus)
  @IsOptional()
  status?: PersonStatus;
}

export class SearchPeopleDto {
  @ApiPropertyOptional({
    description: 'Search keyword matching first name, last name, email, or flightpath ID',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
