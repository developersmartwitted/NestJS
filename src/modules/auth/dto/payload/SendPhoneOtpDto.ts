import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email id, valid email format.',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User phone number.',
  })
  phoneNumber: string;
}
