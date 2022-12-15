import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { EmploymentEntity } from '../entities/employment.entity';

export class EmploymentDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Designtion or role in the company.',
  })
  role: string;

  @ApiPropertyOptional({
    description: 'Name of the company or organization.',
  })
  organizationName: string;

  @ApiPropertyOptional({
    description: 'Company logo name',
  })
  companyLogoName: string;

  @ApiPropertyOptional({
    description:
      'Company logo uploaded location in s3 {folderName/fileName.mimetype}',
  })
  companyLogoLocation: string;

  @ApiPropertyOptional({
    description: 'Worked from month',
  })
  fromMonth: string;

  @ApiPropertyOptional({
    description: 'Worked from year',
  })
  fromYear: string;

  @ApiPropertyOptional({
    description: 'Worked till month',
  })
  toMonth: string;

  @ApiPropertyOptional({
    description: 'Worked till year',
  })
  toYear: string;

  @ApiPropertyOptional({
    description: 'True if the user is currently working in this organization.',
  })
  currentlyWorking: boolean;

  @ApiPropertyOptional({
    description: 'Brief description about the employment',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'True if employment record is deleted',
  })
  isDeleted: boolean;

  constructor(education: EmploymentEntity) {
    super(education);
    this.user = education.user;
    this.role = education.role;
    this.organizationName = education.organizationName;
    this.companyLogoName = education.companyLogoName;
    this.companyLogoLocation = education.companyLogoLocation;
    this.fromMonth = education.fromMonth;
    this.fromYear = education.fromYear;
    this.toMonth = education.toMonth;
    this.toYear = education.toYear;
    this.currentlyWorking = education.currentlyWorking;
    this.description = education.description;

    this.isDeleted = education.isDeleted;
  }
}
