import { EntityRepository, Repository } from 'typeorm';
import { ReputationWeightEntity } from '../entities/reputationWeight.entity';

@EntityRepository(ReputationWeightEntity)
export class ReputationWeightRepository extends Repository<ReputationWeightEntity> {}
