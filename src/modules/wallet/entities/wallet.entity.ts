import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { WalletDto } from '../dto/WalletDto';

@Entity({ name: 'wallet' })
export class WalletEntity extends AbstractEntity<WalletDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  pathIndex: number;

  @Column()
  walletAddress: string;

  @Column({ default: 0, type: 'decimal' })
  balance: number;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = WalletDto;
}
