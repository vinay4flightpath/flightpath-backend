import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({
    example: 'inv_abc123xyz',
    description: 'The invitation token received in email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password for the account',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT Refresh Token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
