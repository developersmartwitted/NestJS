import { Entity, Column, ManyToOne } from 'typeorm';

import { SkillEntity } from './skill.entity';
import { TeamEntity } from '../../team/entities/team.entity';
import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { SkillMapDto } from '../dto/SkillMapDto';
import { ProjectEntity } from '../../project/entities/project.entity';

@Entity({ name: 'skill_map' })
export class SkillMapEntity extends AbstractEntity<SkillMapDto> {
  @ManyToOne(() => SkillEntity, (skill) => skill.id)
  skill: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id, { nullable: true })
  project: ProjectEntity;

  // @ManyToOne(
  //   () => PersonalProjectEntity,
  //   (personalProject) => personalProject.id,
  //   {
  //     nullable: true,
  //   },
  // )
  // personalProject: PersonalProjectEntity;

  @ManyToOne(() => TeamEntity, (team) => team.id, { nullable: true })
  team: TeamEntity;

  @Column()
  status: boolean;

  dtoClass = SkillMapDto;
}
