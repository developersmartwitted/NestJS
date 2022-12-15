import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../../../helpers/decorators/match.decorator';

export class ForgotPasswordDto {
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
  @MinLength(6)
  @MaxLength(25)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  @ApiProperty({
    description:
      'Password must consist of one uppercase letter, one lowercase letter and one special character.',
    type: String,
  })
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(25)
  @Match('password', {
    message: 'Confirm password should match with password',
  })
  @ApiProperty({
    description: 'confirmPassword must be same as password.',
    type: String,
  })
  confirmPassword: string;
}
