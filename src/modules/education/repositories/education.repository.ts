import { EntityRepository, Repository } from 'typeorm';

import { EducationEntity } from '../entities/education.entity';

@EntityRepository(EducationEntity)
export class EducationRepository extends Repository<EducationEntity> {}
