import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { SkillEntity } from '../entities/skill.entity';

export class SkillDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Name of the skill.',
  })
  name: string;

  @ApiPropertyOptional({
    description:
      'Defines whether skill is active or not. If true then it is active else inactive skill.',
  })
  status: boolean;

  constructor(skills: SkillEntity) {
    super(skills);
    this.name = skills.name;
    this.status = skills.status;
  }
}
