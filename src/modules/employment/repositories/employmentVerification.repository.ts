import { EntityRepository, Repository } from 'typeorm';

import { EmploymentVerificationEntity } from '../entities/employmentVerification.entity';

@EntityRepository(EmploymentVerificationEntity)
export class EmploymentVerificationRepository extends Repository<EmploymentVerificationEntity> {}
