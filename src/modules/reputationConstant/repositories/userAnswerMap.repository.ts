import { EntityRepository, Repository } from 'typeorm';

import { UserAnswerMapEntity } from '../entities/userAnswerMap.entity';

@EntityRepository(UserAnswerMapEntity)
export class UserAnswerMapRepository extends Repository<UserAnswerMapEntity> {}
