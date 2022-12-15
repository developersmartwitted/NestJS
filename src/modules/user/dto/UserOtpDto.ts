import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { UserOTPEntity } from '../entities/otp.entity';
import { UserEntity } from '../entities/user.entity';

export class UserOtpDto extends AbstractDto {
  @ApiPropertyOptional({
    type: () => UserEntity,
    description: 'User basic data',
  })
  user: string;

  @IsEmail()
  @ApiPropertyOptional({
    description: 'Email Id.',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Four digit otp to verify email.',
  })
  emailOtp: number;

  @ApiPropertyOptional({
    description: 'Email OTP last sent at date time.',
  })
  emailOtpSendAt: Date;

  @ApiPropertyOptional({
    description: 'Email verification status, default is set to false.',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Valid phone number.',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Four digit otp number to verify the phone number.',
  })
  phoneOtp: number;

  @ApiPropertyOptional({
    description: 'Phone OTP last sent at date time.',
  })
  phoneOtpSendAt: Date;

  @ApiPropertyOptional({
    description: 'Phone number verification status, default is set to false.',
  })
  isPhoneVerified: boolean;

  @ApiPropertyOptional({
    description: 'Four digit otp to update password.',
  })
  forgotPasswordOtp: number;

  @ApiPropertyOptional({
    description: 'Forgot password OTP last sent at date time.',
  })
  passwordOtpSendAt: Date;

  constructor(userOtp: UserOTPEntity) {
    super(userOtp);
    this.user = userOtp.user;
    this.email = userOtp.email;
    this.emailOtp = userOtp.emailOtp;
    this.emailOtpSendAt = userOtp.emailOtpSendAt;
    this.isEmailVerified = userOtp.isEmailVerified;
    this.phoneNumber = userOtp.phoneNumber;
    this.phoneOtp = userOtp.phoneOtp;
    this.phoneOtpSendAt = userOtp.phoneOtpSendAt;
    this.isPhoneVerified = userOtp.isPhoneVerified;
  }
}
