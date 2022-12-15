import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AddProjectFileDto } from '../../../clientProject/dto/payload/AddProjectFileDto';

export class UpdateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Id.',
  })
  readonly projectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title for the project.',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project description.',
  })
  readonly description: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project documents.',
  })
  readonly files: AddProjectFileDto[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Array of skill id.',
  })
  readonly skills: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project budget.',
  })
  readonly budget: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project logo image name.',
  })
  readonly projectLogoName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Project logo image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  readonly projectLogoLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project logo image mime type (jpg, png etc).',
  })
  readonly projectLogoMimeType: string;
}
