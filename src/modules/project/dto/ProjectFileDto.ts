import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ProjectFileEntity } from '../entities/projectFile.entity';

export class ProjectFileDto extends AbstractDto {
  @ApiPropertyOptional({
    description:
      'Location of files uploaded in s3 bucket. It is a string({folder}/{fileName})',
  })
  file: string;

  @ApiPropertyOptional({
    description: 'File name',
  })
  fileName: string;

  @ApiPropertyOptional({
    description: 'File mimeType',
  })
  fileMimeType: string;

  constructor(projectFile: ProjectFileEntity) {
    super(projectFile);
    this.file = projectFile.file;
    this.fileName = projectFile.fileName;
    this.fileMimeType = projectFile.fileMimeType;
  }
}
