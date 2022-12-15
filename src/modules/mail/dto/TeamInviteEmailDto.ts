import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TeamInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member name',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'TeamName',
  })
  readonly teamName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team Image',
  })
  readonly teamImage: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid email id.',
  })
  readonly email: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill names.',
  })
  readonly requiredSkills: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment or breif description about team.',
  })
  readonly comment: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Url to which it needs to be redirected.',
  })
  readonly verificationUrl: string;

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
}
