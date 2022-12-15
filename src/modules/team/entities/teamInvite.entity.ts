import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TeamInviteDto } from '../dto/TeamInviteDto';
import { TeamEntity } from './team.entity';

@Entity({ name: 'team_invite' })
export class TeamInviteEntity extends AbstractEntity<TeamInviteDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  invitedBy: UserEntity;

  @ManyToOne(() => TeamEntity, (team) => team.id)
  team: TeamEntity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  designation: string;

  @Column()
  comment: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  verifier: UserEntity;

  dtoClass = TeamInviteDto;
}
