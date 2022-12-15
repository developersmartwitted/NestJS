import { EntityRepository, Repository } from 'typeorm';

import { AnswerEntity } from '../entities/answer.entity';

@EntityRepository(AnswerEntity)
export class AnswerRepository extends Repository<AnswerEntity> {}
