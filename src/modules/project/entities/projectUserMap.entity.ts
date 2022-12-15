import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ProjectUserMapDto } from '../dto/ProjectUserMapDto';
import { ProjectType } from '../enums/projectType.enum';
import { ProjectEntity } from './project.entity';

@Entity({ name: 'project_user_map' })
export class ProjectUserMapEntity extends AbstractEntity<ProjectUserMapDto> {
  @ManyToOne(() => ProjectEntity, (project) => project.id)
  project: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  createdByUser: string;

  @Column()
  status: boolean;

  @Column()
  type: ProjectType;

  @Column({ nullable: true })
  message: string;

  dtoClass = ProjectUserMapDto;
}
