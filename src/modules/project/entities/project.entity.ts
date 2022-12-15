import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { ProjectDto } from '../dto/ProjectDto';
import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { SkillMapEntity } from '../../skill/entities/skillMap.entity';
import { ProjectFileEntity } from './projectFile.entity';
import { ProjectStatus } from '../enums/projectStatus.enum';
import { UserEntity } from '../../user/entities/user.entity';
import { ProjectUserMapEntity } from './projectUserMap.entity';

@Entity({ name: 'project' })
export class ProjectEntity extends AbstractEntity<ProjectDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  projectLogoName: string;

  @Column({ nullable: true })
  projectLogoLocation: string;

  @Column({ nullable: true })
  projectLogoMimeType: string;

  @Column()
  budget: string;

  @OneToMany(() => ProjectFileEntity, (projectFiles) => projectFiles.project)
  file: ProjectFileEntity;

  @OneToMany(() => SkillMapEntity, (skill) => skill.project)
  skill: SkillMapEntity;

  @Column({ default: ProjectStatus.CREATED })
  status: ProjectStatus;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => ProjectUserMapEntity, (projectMap) => projectMap.project)
  projectMap: ProjectUserMapEntity;

  dtoClass = ProjectDto;
}
