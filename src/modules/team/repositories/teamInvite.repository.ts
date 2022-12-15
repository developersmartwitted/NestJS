import { EntityRepository, Repository } from 'typeorm';

import { TeamInviteEntity } from '../entities/teamInvite.entity';

@EntityRepository(TeamInviteEntity)
export class TeamInviteRepository extends Repository<TeamInviteEntity> {}
