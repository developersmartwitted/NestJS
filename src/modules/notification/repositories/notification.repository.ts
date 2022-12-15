import { EntityRepository, Repository } from 'typeorm';
import { NotificationsEntity } from '../entities/notifications.entity';

@EntityRepository(NotificationsEntity)
export class NotificationRepository extends Repository<NotificationsEntity> {}
