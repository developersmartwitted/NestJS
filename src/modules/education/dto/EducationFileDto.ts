import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { CertificationEntity } from '../entities/certification.entity';
import { EducationEntity } from '../entities/education.entity';
import { EducationFileEntity } from '../entities/educationFile.entity';

export class EducationFileDto extends AbstractDto {
  @ApiPropertyOptional({
    type: () => EducationEntity,
    description: 'User education id for which the file is uploaded.',
  })
  education: EducationEntity;

  @ApiPropertyOptional({
    type: () => CertificationEntity,
    description: 'User certification id for which the file is uploaded.',
  })
  certification: CertificationEntity;

  @ApiPropertyOptional({
    description: 'Uploaded education file name.',
  })
  fileName: string;

  @ApiPropertyOptional({
    description:
      'Uploaded education file location {folderName/filename.mimetype} .',
  })
  fileLocation: string;

  @ApiPropertyOptional({
    description: 'Uploaded file mimetype.',
  })
  fileMimeType: string;

  constructor(educationFile: EducationFileEntity) {
    super(educationFile);
    this.education = educationFile.education;
    this.certification = educationFile.certification;
    this.fileName = educationFile.fileName;
    this.fileLocation = educationFile.fileLocation;
    this.fileMimeType = educationFile.fileMimeType;
  }
}
