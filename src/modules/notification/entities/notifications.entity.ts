import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { NotificationsDto } from '../dto/NotificationsDto';
import { NotificationTypes } from '../enums/notificationType.enum';

@Entity({ name: 'notifications' })
export class NotificationsEntity extends AbstractEntity<NotificationsDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: string;

  @Column()
  notificationType: NotificationTypes;

  @Column({ nullable: true })
  typeId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  isViewed: boolean;

  dtoClass = NotificationsDto;
}
