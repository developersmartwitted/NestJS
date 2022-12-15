import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { CertificationEntity } from '../entities/certification.entity';
import { EducationFileEntity } from '../entities/educationFile.entity';

export class CertificationDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Degree name.',
  })
  certificate: string;

  @ApiPropertyOptional({
    description: 'School name.',
  })
  institution: string;

  @ApiPropertyOptional({
    description: 'Year of completion.',
  })
  year: string;

  @ApiPropertyOptional({
    description: 'School name.',
  })
  comments: string;

  @ApiPropertyOptional({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'Certificates files location which are stored in s3',
    type: () => EducationFileEntity,
  })
  file: EducationFileEntity;

  @ApiPropertyOptional({
    description: 'True if projcet is deleted',
  })
  isDeleted: boolean;

  constructor(certification: CertificationEntity) {
    super(certification);
    this.certificate = certification.certificate;
    this.institution = certification.institution;
    this.year = certification.year;
    this.comments = certification.comments;
    this.user = certification.user;
    this.file = certification.file;
    this.isDeleted = certification.isDeleted;
  }
}
