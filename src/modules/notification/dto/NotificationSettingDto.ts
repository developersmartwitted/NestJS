import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { NotificationSettingEntity } from '../entities/notificationSetting.entity';

export class NotificationSettingDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'If user wants to receive emails or not.',
  })
  isEmail: boolean;

  @ApiPropertyOptional({
    description: 'Number of external connections allowed per user.',
  })
  externalConnection: number;

  @ApiPropertyOptional({
    description: 'Number of internal connections allowed per user.',
  })
  internalConnection: number;

  @ApiPropertyOptional({
    description: 'UserId of the user.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'True if notification settings is deleted',
  })
  isDeleted: boolean;

  constructor(notificationSetting: NotificationSettingEntity) {
    super(notificationSetting);
    this.user = notificationSetting.user;
    this.isEmail = notificationSetting.isEmail;
    this.externalConnection = notificationSetting.externalConnection;
    this.internalConnection = notificationSetting.internalConnection;
    this.isDeleted = notificationSetting.isDeleted;
  }
}
