import { EntityRepository, Repository } from 'typeorm';

import { NotificationSettingEntity } from '../entities/notificationSetting.entity';

@EntityRepository(NotificationSettingEntity)
export class NotificationSettingRepository extends Repository<NotificationSettingEntity> {}
