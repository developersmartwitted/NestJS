import { EntityRepository, Repository } from 'typeorm';

import { QuestionEntity } from '../entities/question.entity';

@EntityRepository(QuestionEntity)
export class QuestionRepository extends Repository<QuestionEntity> {}
