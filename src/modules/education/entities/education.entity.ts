import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { EducationDto } from '../dto/EducationDto';
import { EducationFileEntity } from './educationFile.entity';

@Entity({ name: 'education' })
export class EducationEntity extends AbstractEntity<EducationDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  degree: string;

  @Column()
  school: string;

  @Column()
  year: string;

  @OneToMany(
    () => EducationFileEntity,
    (educationFile) => educationFile.education,
  )
  file: EducationFileEntity;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = EducationDto;
}
