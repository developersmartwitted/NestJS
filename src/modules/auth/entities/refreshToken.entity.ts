import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokenEntity extends AbstractEntity<RefreshTokenDto> {
  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn()
  user: UserEntity | string;

  @Column()
  isRevoked: boolean;

  @Column()
  expires: Date;

  dtoClass = RefreshTokenDto;
}
