import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'vinay@flightpath-training.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Password must be at least 4 characters long.' })
  password: string;
}
