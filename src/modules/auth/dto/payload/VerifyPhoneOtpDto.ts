import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifyPhoneOtpDto {
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

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User phone number.',
  })
  phoneNumber: string;
}
