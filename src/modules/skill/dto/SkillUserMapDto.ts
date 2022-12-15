import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { SkillEntity } from '../entities/skill.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SkillUserMapEntity } from '../entities/skillUserMap.entity';

export class SkillUserMapDto extends AbstractDto {
  @ApiProperty({ type: () => SkillEntity, description: 'Skill id' })
  skill: string;

  @ApiProperty({
    description:
      'Defines whether skill is active or not. If true then it is active else inactive skill.',
  })
  status: boolean;

  @ApiProperty({
    description: 'Levels, Intermediate, Beginner.',
  })
  level: string;

  @ApiProperty({
    description: 'Experience duration in months or year.',
  })
  experience: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User id.',
  })
  user: UserEntity;

  constructor(skillUserMap: SkillUserMapEntity) {
    super(skillUserMap);
    this.skill = skillUserMap.skill;
    this.user = skillUserMap.user;
    this.level = skillUserMap.level;
    this.experience = skillUserMap.experience;
    this.status = skillUserMap.status;
  }
}
