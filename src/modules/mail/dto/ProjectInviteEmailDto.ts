import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ProjectInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member name',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Name',
  })
  readonly projectName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Image',
  })
  readonly projectImage: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project description',
  })
  readonly description: string;

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
    description: 'Skill names.',
  })
  readonly requiredSkills: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited users name',
  })
  readonly invitedByName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited users email id. Valid email id.',
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
    description: 'Comment or breif description about project.',
  })
  readonly comment: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Url to which it needs to be redirected.',
  })
  readonly verificationUrl: string;
}
