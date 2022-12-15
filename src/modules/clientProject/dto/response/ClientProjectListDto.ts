import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectFileEntity } from '../../../project/entities/projectFile.entity';

export class ClientProjectListDto {
  @ApiProperty({
    description: 'Project name.',
  })
  clientProjectId: string;

  @ApiProperty({
    description: 'Project name.',
  })
  name: string;

  @ApiProperty({
    description: 'Project url.',
  })
  url: string;

  @ApiProperty({
    description: 'Uploaded logo file name.',
  })
  logoName: string;

  @ApiProperty({
    description: 'Uploaded logo file location {folderName/filename.mimetype} .',
  })
  logoLocation: string;

  @ApiProperty({
    description: 'Uploaded logo mimetype.',
  })
  logoMimeType: string;

  @ApiProperty({
    description: 'Project description.',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Project files location which are stored in s3',
    type: () => ProjectFileEntity,
  })
  file: ProjectFileEntity;
}
