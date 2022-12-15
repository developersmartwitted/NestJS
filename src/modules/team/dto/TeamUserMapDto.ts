import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { TeamUserMapEntity } from '../entities/teamUserMap.entity';

export class TeamUserMapDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Status if it is active or not',
  })
  status: boolean;

  @ApiPropertyOptional({
    description: 'Defines if the record is deleted or not',
  })
  isDeleted: boolean;

  constructor(teamUserMap: TeamUserMapEntity) {
    super(teamUserMap);
    this.status = teamUserMap.status;
    this.isDeleted = teamUserMap.isDeleted;
  }
}
