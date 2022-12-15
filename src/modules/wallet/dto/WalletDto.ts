import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { WalletEntity } from '../entities/wallet.entity';

export class WalletDto extends AbstractDto {
  @ApiProperty({
    description: 'UserId of the user.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiProperty({
    description: 'PathIndex for  derivered path',
  })
  pathIndex: number;

  @ApiProperty({
    description: 'Wallet address',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'Wallet address',
  })
  balance: number;

  @ApiProperty({
    description: 'True if employment record is deleted',
  })
  isDeleted: boolean;

  constructor(wallet: WalletEntity) {
    super(wallet);
    this.user = wallet.user;
    this.pathIndex = wallet.pathIndex;
    this.walletAddress = wallet.walletAddress;
    this.balance = wallet.balance;
    this.isDeleted = wallet.isDeleted;
  }
}
