import { EntityRepository, Repository } from 'typeorm';

import { SkillMapEntity } from '../entities/skillMap.entity';

@EntityRepository(SkillMapEntity)
export class SkillMapRepository extends Repository<SkillMapEntity> {}
