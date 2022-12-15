import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EmploymentEntity } from './employment.entity';
import { EmploymentVerificationDto } from '../dto/EmploymentVerificationDto';

@Entity({ name: 'employment_verification' })
export class EmploymentVerificationEntity extends AbstractEntity<EmploymentVerificationDto> {
  @ManyToOne(() => EmploymentEntity, (employment) => employment.id)
  employment: EmploymentEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  verifier: UserEntity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  role: string;

  @Column()
  comments: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = EmploymentVerificationDto;
}
