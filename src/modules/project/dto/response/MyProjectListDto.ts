import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { SkillMapDto } from '../../../skill/dto/SkillMapDto';

export class MyProjectListDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project id',
  })
  readonly projectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project name',
  })
  readonly projectName: string;

  @IsString()
  @ApiProperty({
    description: 'Brief description about the project',
  })
  readonly description: string;

  @IsArray()
  @ApiProperty({
    description: 'Array of skills. skill id and skill name added for project.',
  })
  readonly skills: SkillMapDto[];

  @IsString()
  @ApiProperty({
    description: 'project budget.',
  })
  readonly budget: string;

  @IsString()
  @ApiProperty({
    description: 'Project logo image name.',
  })
  readonly projectLogoName: string;

  @IsString()
  @ApiProperty({
    description:
      'Project logo image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  readonly projectLogoLocation: string;

  @IsString()
  @ApiProperty({
    description: 'Project logo image mime type (jpg, png etc).',
  })
  readonly projectLogoMimeType: string;

  @IsNumber()
  @ApiProperty({
    description: 'Number of users applied to the project.',
  })
  readonly applicantCount: number;
}
