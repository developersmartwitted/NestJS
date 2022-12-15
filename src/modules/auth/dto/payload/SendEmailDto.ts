import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email id in valid email format.',
  })
  email: string;
}
