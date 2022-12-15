import { EntityRepository, Repository } from 'typeorm';

import { EducationFileEntity } from '../entities/educationFile.entity';

@EntityRepository(EducationFileEntity)
export class EducationFileRepository extends Repository<EducationFileEntity> {}
