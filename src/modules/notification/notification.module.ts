import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from '../../helpers/gateway/app.gateway';
import { LoggerService } from '../../shared/providers/logger.service';
import { ClientProjectVerifyRepository } from '../clientProject/repositories/clientProjectVerify.repository';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';
import { EmploymentVerificationRepository } from '../employment/repositories/employmentVerification.repository';
import { ProjectInviteRepository } from '../project/repositories/projectInvite.repository';
import { SkillVerificationRepository } from '../skill/repositories/skillVerification.repository';
import { TeamInviteRepository } from '../team/repositories/teamInvite.repository';

import { UserModule } from '../user/user.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationSettingRepository } from './repositories/notificationSetting.repository';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      NotificationRepository,
      NotificationSettingRepository,
      ClientProjectVerifyRepository,
      SkillVerificationRepository,
      EmploymentVerificationRepository,
      TeamInviteRepository,
      ProjectInviteRepository,
      ConnectionInviteRepository,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, LoggerService, AppGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
