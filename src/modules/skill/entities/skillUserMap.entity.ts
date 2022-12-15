import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { SkillEntity } from './skill.entity';
import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SkillUserMapDto } from '../dto/SkillUserMapDto';
import { SkillVerificationEntity } from './skillVerification.entity';

@Entity({ name: 'skill_user_map' })
export class SkillUserMapEntity extends AbstractEntity<SkillUserMapDto> {
  @ManyToOne(() => SkillEntity, (skill) => skill.id)
  skill: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  user: UserEntity;

  @OneToMany(
    () => SkillVerificationEntity,
    (skillVerify) => skillVerify.skillUserMap,
  )
  skillVerify: SkillVerificationEntity;

  @Column()
  level: string;

  @Column()
  experience: string;

  @Column({ default: true })
  status: boolean;

  dtoClass = SkillUserMapDto;
}
