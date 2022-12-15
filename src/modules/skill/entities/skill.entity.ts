import { Entity, Column, ManyToOne } from 'typeorm';

import { SkillDto } from '../dto/SkillDto';
import { UserEntity } from '../../user/entities/user.entity';
import { AbstractEntity } from '../../../helpers/entities/abstract.entity';

@Entity({ name: 'skills' })
export class SkillEntity extends AbstractEntity<SkillDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  createdBy: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ default: true })
  status: boolean;

  dtoClass = SkillDto;
}
