import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { StripeAccountDto } from '../dto/StripeAccountDto';

@Entity({ name: 'stripe_account' })
export class StripeAccountEntity extends AbstractEntity<StripeAccountDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  accountId: string;

  @Column({ default: false })
  status: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = StripeAccountDto;
}
