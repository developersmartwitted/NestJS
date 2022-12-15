import { EntityRepository, Repository } from 'typeorm';

import { ClientProjectVerifyEntity } from '../entities/clientProjectVerify.entity';

@EntityRepository(ClientProjectVerifyEntity)
export class ClientProjectVerifyRepository extends Repository<ClientProjectVerifyEntity> {}
