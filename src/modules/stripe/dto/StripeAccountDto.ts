import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { StripeAccountEntity } from '../entities/stripeAccount.entity';

export class StripeAccountDto extends AbstractDto {
  @ApiProperty({
    type: () => UserEntity,
    description: 'User id.',
  })
  user: UserEntity;

  @ApiProperty({
    description: 'Stripe account id.',
  })
  accountId: string;

  @ApiProperty({
    description: 'Status of the strip account, default set to false',
  })
  status: boolean;

  @ApiProperty({
    description: 'If account is deleted it is set to true',
  })
  isDeleted: boolean;

  constructor(stripeAccount: StripeAccountEntity) {
    super(stripeAccount);
    this.user = stripeAccount.user;
    this.accountId = stripeAccount.accountId;
    this.status = stripeAccount.status;
    this.isDeleted = stripeAccount.isDeleted;
  }
}
