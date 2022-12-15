import { EntityRepository, Repository } from 'typeorm';

import { ConnectionInviteEntity } from '../entities/connectionInvite.entity';

@EntityRepository(ConnectionInviteEntity)
export class ConnectionInviteRepository extends Repository<ConnectionInviteEntity> {}
