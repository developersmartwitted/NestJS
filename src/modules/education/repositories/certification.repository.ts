import { EntityRepository, Repository } from 'typeorm';

import { CertificationEntity } from '../entities/certification.entity';

@EntityRepository(CertificationEntity)
export class CertificationRepository extends Repository<CertificationEntity> {}
