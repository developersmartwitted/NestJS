import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ConnectionInviteDto } from '../dto/ConnectionInviteDto';
import { ConnectionType } from '../enums/connectionType.enum';

@Entity({ name: 'connection_invite' })
export class ConnectionInviteEntity extends AbstractEntity<ConnectionInviteDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  invitedBy: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  user: UserEntity;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  comment: string;

  @Column({ default: false })
  status: boolean;

  @Column({ default: ConnectionType.INVITED })
  type: ConnectionType;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = ConnectionInviteDto;
}
