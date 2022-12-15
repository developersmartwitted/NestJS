import { ApiPropertyOptional } from '@nestjs/swagger';

export class EmploymentListDto {
  @ApiPropertyOptional({
    description: 'Designtion or role in the company.',
  })
  employmentId: string;

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
}
