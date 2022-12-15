import { EntityRepository, Repository } from 'typeorm';

import { DiscourseEntity } from '../entities/discourse.entity';

@EntityRepository(DiscourseEntity)
export class DiscourseRepository extends Repository<DiscourseEntity> {}
