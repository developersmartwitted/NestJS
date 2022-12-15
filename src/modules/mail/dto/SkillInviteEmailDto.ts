import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SkillInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member name',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill Name',
  })
  readonly skillName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid email id of the member.',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid email id of user who is inviting.',
  })
  readonly invitedByEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number of the verifier.',
  })
  invitedByPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of user who is inviting.',
  })
  readonly invitedByName: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Level of expertise with the skill.',
  })
  readonly level: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Experience with the skill.',
  })
  readonly experience: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Url to which it needs to be redirected.',
  })
  readonly verificationUrl: string;
}
