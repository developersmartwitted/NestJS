import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { NotificationsEntity } from '../entities/notifications.entity';
import { NotificationTypes } from '../enums/notificationType.enum';

export class NotificationsDto extends AbstractDto {
  @ApiProperty({
    description: 'If user wants to receive emails or not.',
    enum: NotificationTypes,
  })
  notificationType: NotificationTypes;

  @ApiProperty({
    description: 'UserId of the user.',
    type: () => UserEntity,
  })
  user: string;

  @ApiPropertyOptional({
    description: 'It is primary Id of the type of notification',
  })
  typeId: string;

  @ApiPropertyOptional({
    description: 'Notification title',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Notification text',
  })
  message: string;

  @ApiProperty({
    description: 'False if notification is not yet viewed by the user',
  })
  isViewed: boolean;

  @ApiProperty({
    description: 'False if notification is deleted',
  })
  status: boolean;

  constructor(notification: NotificationsEntity) {
    super(notification);
    this.user = notification.user;
    this.notificationType = notification.notificationType;
    this.typeId = notification.typeId;
    this.title = notification.title;
    this.message = notification.message;
    this.isViewed = notification.isViewed;
    this.status = notification.status;
  }
}
