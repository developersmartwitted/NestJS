import { Entity, Column, ManyToOne } from 'typeorm';

import { SkillEntity } from './skill.entity';
import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SkillUserMapEntity } from './skillUserMap.entity';
import { SkillVerificationDto } from '../dto/SkillVerificationDto';

@Entity({ name: 'skill_verification' })
export class SkillVerificationEntity extends AbstractEntity<SkillVerificationDto> {
  @ManyToOne(() => SkillEntity, (skill) => skill.id)
  skill: SkillEntity;

  @ManyToOne(() => SkillUserMapEntity, (skillUserMap) => skillUserMap.id)
  skillUserMap: SkillUserMapEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  verifier: UserEntity;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  role: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  status: boolean;

  dtoClass = SkillVerificationDto;
}
