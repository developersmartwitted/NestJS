import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CertificationDto } from '../dto/CertificationDto';
import { EducationFileEntity } from './educationFile.entity';

@Entity({ name: 'certification' })
export class CertificationEntity extends AbstractEntity<CertificationDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  certificate: string;

  @Column()
  institution: string;

  @Column()
  year: string;

  @Column()
  comments: string;

  @OneToMany(
    () => EducationFileEntity,
    (certificateFile) => certificateFile.certification,
  )
  file: EducationFileEntity;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = CertificationDto;
}
