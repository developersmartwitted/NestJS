import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { SkillEntity } from '../entities/skill.entity';
import { TeamEntity } from '../../team/entities/team.entity';
import { SkillMapEntity } from '../entities/skillMap.entity';
import { ProjectEntity } from '../../project/entities/project.entity';
// import { ProjectEntity } from '../../project/entities/project.entity';

export class SkillMapDto extends AbstractDto {
  @ApiPropertyOptional({
    description:
      'Defines whether skill is active or not. If true then it is active else inactive skill.',
  })
  status: boolean;

  @ApiPropertyOptional({ type: () => SkillEntity, description: 'Skill id' })
  skill: string;

  @ApiPropertyOptional({
    type: () => ProjectEntity,
    description: 'Project id, if it  is project skill',
  })
  project: ProjectEntity;

  // @ApiPropertyOptional({
  //   type: () => PersonalProjectEntity,
  //   description:
  //     'Personal project id, If the skill added for personal project.',
  // })
  // personalProject: PersonalProjectEntity;

  @ApiPropertyOptional({
    type: () => TeamEntity,
    description: 'Team id, if the skill is added for team.',
  })
  team: TeamEntity;

  constructor(skillMap: SkillMapEntity) {
    super(skillMap);
    this.status = skillMap.status;
    this.skill = skillMap.skill;
    this.project = skillMap.project;
    // this.personalProject = skillUserMap.personalProject;
    this.team = skillMap.team;
  }
}
