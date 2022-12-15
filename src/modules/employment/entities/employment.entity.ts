import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EmploymentDto } from '../dto/EmploymentDto';
import { EmploymentVerificationEntity } from './employmentVerification.entity';

@Entity({ name: 'employment' })
export class EmploymentEntity extends AbstractEntity<EmploymentDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  role: string;

  @Column()
  organizationName: string;

  @Column()
  companyLogoName: string;

  @Column()
  companyLogoLocation: string;

  @Column()
  fromMonth: string;

  @Column()
  fromYear: string;

  @Column()
  toMonth: string;

  @Column()
  toYear: string;

  @Column()
  currentlyWorking: boolean;

  @Column()
  description: string;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(
    () => EmploymentVerificationEntity,
    (employmentVerify) => employmentVerify.employment,
  )
  employmentVerify: EmploymentVerificationEntity;

  dtoClass = EmploymentDto;
}
