import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { FilterDto } from '../../../../helpers/dto/FilterDto';
import { ProjectBy } from '../../enums/projectBy.enum';
import { ProjectStatus } from '../../enums/projectStatus.enum';
import { ProjectType } from '../../enums/projectType.enum';

export class MyProjectDto extends FilterDto {
  @IsEnum(ProjectBy)
  @IsNotEmpty()
  @ApiProperty({
    description: 'This could be either "ME" or "ELSE".',
    type: ProjectBy,
  })
  readonly createdBy: ProjectBy;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'This could be either one of project status.',
  })
  readonly status: ProjectStatus & ProjectType;
}
