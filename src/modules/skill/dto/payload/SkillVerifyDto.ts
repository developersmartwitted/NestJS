import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SkillVerifyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Member name.',
  })
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Member email, valid email format.',
  })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Member designation.',
  })
  readonly role: string;
}
