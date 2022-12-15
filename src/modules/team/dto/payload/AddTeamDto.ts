import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AddTeamInviteDto } from './AddTeamInviteDto';

export class AddTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team name',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Brief description about the team',
  })
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team profile image name.',
  })
  readonly profileImageName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Team profile image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  readonly profileImageLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team profile image mime type (jpg, png etc).',
  })
  readonly profileImageMimeType: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Array of skill id added for team.',
  })
  readonly skills: string[];

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Array of AddTeamInviteDto data',
    type: AddTeamInviteDto,
  })
  readonly inviteMembers: AddTeamInviteDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment for sending invites.',
  })
  readonly comment: string;
}
