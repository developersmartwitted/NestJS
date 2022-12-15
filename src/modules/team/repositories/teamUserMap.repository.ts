import { EntityRepository, Repository } from 'typeorm';

import { TeamUserMapEntity } from '../entities/teamUserMap.entity';

@EntityRepository(TeamUserMapEntity)
export class TeamUserMapRepository extends Repository<TeamUserMapEntity> {}
