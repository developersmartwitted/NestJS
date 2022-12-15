import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email id, valid email format.',
  })
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '6 digit OTP number.',
  })
  otp: number;
}
