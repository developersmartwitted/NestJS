import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateEmploymentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Employment id for which it is needed to be updated.',
  })
  readonly employmentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Designtion or role in the company.',
  })
  readonly role: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the company or organization.',
  })
  readonly organizationName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Company logo name',
  })
  readonly companyLogoName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Company logo uploaded location in s3 {folderName/fileName.mimetype}',
  })
  readonly companyLogoLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Worked from month',
  })
  readonly fromMonth: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Worked from year',
  })
  readonly fromYear: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Worked till month',
  })
  readonly toMonth: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Worked till year',
  })
  readonly toYear: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'True if the user is currently working in this organization.',
  })
  readonly currentlyWorking: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Brief description about the employment',
  })
  readonly description: string;
}
