import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionInviteRepository } from './repositories/connectionInvite.repository';
import { MailService } from '../mail/mail.service';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { AppGateway } from '../../helpers/gateway/app.gateway';
import { AdminSettingsModule } from '../adminSettings/adminSettings.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AdminSettingsModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([ConnectionInviteRepository]),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [ConnectionController],
  providers: [ConnectionService, LoggerService, MailService, AppGateway],
  exports: [ConnectionService],
})
export class ConnectionModule {}
