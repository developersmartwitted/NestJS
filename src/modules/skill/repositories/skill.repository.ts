import { EntityRepository, Repository } from 'typeorm';

import { SkillEntity } from '../entities/skill.entity';

@EntityRepository(SkillEntity)
export class SkillRepository extends Repository<SkillEntity> {}
