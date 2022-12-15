import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ProjectInviteDto } from '../dto/ProjectInviteDto';
import { ProjectEntity } from './project.entity';

@Entity({ name: 'project_invite' })
export class ProjectInviteEntity extends AbstractEntity<ProjectInviteDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  invitedBy: UserEntity;

  @ManyToOne(() => ProjectEntity, (project) => project.id)
  project: ProjectEntity;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  skills: string;

  @Column()
  comment: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  verifier: UserEntity;

  dtoClass = ProjectInviteDto;
}
