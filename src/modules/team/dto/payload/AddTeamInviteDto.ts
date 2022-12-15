import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddTeamInviteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member first name',
  })
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member last name',
  })
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid email id.',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Designation of the invited user.',
  })
  readonly designation: string;
}
