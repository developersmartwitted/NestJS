import { EntityRepository, Repository } from 'typeorm';

import { StripeAccountEntity } from '../entities/stripeAccount.entity';

@EntityRepository(StripeAccountEntity)
export class StripeAccountRepository extends Repository<StripeAccountEntity> {}
