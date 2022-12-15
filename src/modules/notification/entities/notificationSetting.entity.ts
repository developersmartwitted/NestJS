import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { NotificationSettingDto } from '../dto/NotificationSettingDto';

@Entity({ name: 'notification_settings' })
export class NotificationSettingEntity extends AbstractEntity<NotificationSettingDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column({ default: true })
  isEmail: boolean;

  @Column()
  externalConnection: number;

  @Column()
  internalConnection: number;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = NotificationSettingDto;
}
