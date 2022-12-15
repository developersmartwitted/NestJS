import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AddProjectFileDto } from './AddProjectFileDto';

export class UpdateClientProjectDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Client Project id.',
  })
  clientProjectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project name.',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project url.',
  })
  url: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded logo file name.',
  })
  logoName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded logo file location {folderName/filename.mimetype} .',
  })
  logoLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded logo mimetype.',
  })
  logoMimeType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project description.',
  })
  description: string;

  @IsArray()
  @ApiProperty({
    description: 'Project documents.',
  })
  supportingDocs: AddProjectFileDto[];
}
