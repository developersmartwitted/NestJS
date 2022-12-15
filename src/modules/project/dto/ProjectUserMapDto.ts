import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ProjectUserMapEntity } from '../entities/projectUserMap.entity';
import { ProjectType } from '../enums/projectType.enum';

export class ProjectUserMapDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'It defines if the record is active or not.',
  })
  status: boolean;

  @ApiPropertyOptional({
    description:
      'Message which is added by the user who is applying for the project.',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Defines whether it is of type invite or apply or create.',
    enum: ProjectType,
  })
  type: ProjectType;

  constructor(projectUserMap: ProjectUserMapEntity) {
    super(projectUserMap);
    this.status = projectUserMap.status;
    this.message = projectUserMap.message;
    this.type = projectUserMap.type;
  }
}
