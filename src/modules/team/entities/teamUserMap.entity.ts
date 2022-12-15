import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { TeamUserMapDto } from '../dto/TeamUserMapDto';
import { TeamType } from '../enums/teamType.enum';
import { TeamEntity } from './team.entity';

@Entity({ name: 'team_user_map' })
export class TeamUserMapEntity extends AbstractEntity<TeamUserMapDto> {
  @ManyToOne(() => TeamEntity, (project) => project.id)
  team: TeamEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  createdByUser: UserEntity;

  @Column({ default: true })
  status: boolean;

  @Column()
  type: TeamType;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = TeamUserMapDto;
}
