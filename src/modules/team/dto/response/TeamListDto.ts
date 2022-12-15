import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { SkillMapDto } from '../../../skill/dto/SkillMapDto';
import { TeamMemberDto } from './TeamMemberDto';

export class TeamListDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team id',
  })
  readonly teamId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team name',
  })
  readonly teamName: string;

  @IsString()
  @ApiProperty({
    description: 'Brief description about the team',
  })
  readonly description: string;

  @IsArray()
  @ApiProperty({
    description: 'Array of skills. skill id and skill name added for team.',
  })
  readonly skills: SkillMapDto[];

  @IsString()
  @ApiProperty({
    description: 'Team profile image name.',
  })
  readonly profileImageName: string;

  @IsString()
  @ApiProperty({
    description:
      'Team profile image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  readonly profileImageLocation: string;

  @IsString()
  @ApiProperty({
    description: 'Team profile image mime type (jpg, png etc).',
  })
  readonly profileImageMimeType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Defines if the user is owner of the project or not',
  })
  readonly type: string;

  @IsString()
  @ApiPropertyOptional({
    description: 'Array of user info who has been invited to the team.',
  })
  readonly teamMembers: TeamMemberDto[];
}
