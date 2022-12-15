import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendConnectionInviteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Members first name',
  })
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Members last name',
  })
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Members phone number',
  })
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid Email Id.',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Members phone number',
  })
  readonly comment: string;
}
