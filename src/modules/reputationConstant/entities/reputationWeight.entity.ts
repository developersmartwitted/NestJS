import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ReputationWeightDto } from '../dto/ReputationWeightDto';

@Entity({ name: 'reputation_weights' })
export class ReputationWeightEntity extends AbstractEntity<ReputationWeightDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  createdBy: UserEntity;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  basicKyc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  advanceKyc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  skillRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  skills: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  education: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  certification: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clientProject: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  employmentHistory: number;

  dtoClass = ReputationWeightDto;
}
