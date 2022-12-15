import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { EducationFileDto } from '../dto/EducationFileDto';
import { CertificationEntity } from './certification.entity';
import { EducationEntity } from './education.entity';

@Entity({ name: 'education_file' })
export class EducationFileEntity extends AbstractEntity<EducationFileDto> {
  @ManyToOne(() => EducationEntity, (education) => education.id, {
    nullable: true,
  })
  education: EducationEntity;

  @ManyToOne(() => CertificationEntity, (certification) => certification.id, {
    nullable: true,
  })
  certification: CertificationEntity;

  @Column()
  fileName: string;

  @Column()
  fileLocation: string;

  @Column()
  fileMimeType: string;

  dtoClass = EducationFileDto;
}
