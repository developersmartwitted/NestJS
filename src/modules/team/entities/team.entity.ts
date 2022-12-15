import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SkillMapEntity } from '../../skill/entities/skillMap.entity';
import { TeamDto } from '../dto/TeamDto';
import { TeamUserMapEntity } from './teamUserMap.entity';
import { TeamInviteEntity } from './teamInvite.entity';

@Entity({ name: 'team' })
export class TeamEntity extends AbstractEntity<TeamDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  profileImageName: string;

  @Column({ nullable: true })
  profileImageLocation: string;

  @Column({ nullable: true })
  profileImageMimeType: string;

  @OneToMany(() => SkillMapEntity, (skill) => skill.team)
  skills: SkillMapEntity;

  @OneToMany(() => TeamUserMapEntity, (teamMap) => teamMap.team)
  teamMap: TeamUserMapEntity;

  @OneToMany(() => TeamInviteEntity, (teamInvite) => teamInvite.team)
  teamInvite: TeamInviteEntity;

  @Column({ default: true })
  status: boolean;

  dtoClass = TeamDto;
}
