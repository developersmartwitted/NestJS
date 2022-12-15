import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { EducationEntity } from '../entities/education.entity';
import { EducationFileEntity } from '../entities/educationFile.entity';

export class EducationDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Degree name.',
  })
  degree: string;

  @ApiPropertyOptional({
    description: 'School name.',
  })
  school: string;

  @ApiPropertyOptional({
    description: 'Year of completion.',
  })
  year: string;

  @ApiPropertyOptional({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'Educations files location which are stored in s3',
    type: () => EducationFileEntity,
  })
  file: EducationFileEntity;

  @ApiPropertyOptional({
    description: 'True if projcet is deleted',
  })
  isDeleted: boolean;

  constructor(education: EducationEntity) {
    super(education);
    this.degree = education.degree;
    this.school = education.school;
    this.year = education.year;
    this.user = education.user;
    this.file = education.file;
    this.isDeleted = education.isDeleted;
  }
}
