import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'User Email id. It must be valid email format.',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description:
      'Password must consist of one uppercase letter, one lowercase letter and one special character.',
  })
  password: string;
}
