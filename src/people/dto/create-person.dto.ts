import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@flightacademy.com', description: 'Email address' })
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+1 (555) 019-2834', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to immediately generate an activation invite token',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendInvite?: boolean;
}
