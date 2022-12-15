import { EntityRepository, Repository } from 'typeorm';

import { SkillVerificationEntity } from '../entities/skillVerification.entity';

@EntityRepository(SkillVerificationEntity)
export class SkillVerificationRepository extends Repository<SkillVerificationEntity> {}
