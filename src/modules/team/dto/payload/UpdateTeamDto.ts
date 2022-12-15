import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateTeamDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'Team id',
  })
  readonly teamId: string;

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
}
