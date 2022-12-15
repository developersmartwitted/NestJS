import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { LoggerService } from '../../shared/providers/logger.service';
import { ClientProjectRepository } from './repositories/clientProject.repository';
import { ClientProjectController } from './clientProject.controller';
import { ClientProjectService } from './clientProject.service';
import { ProjectFileRepository } from '../project/repositories/projectFile.repository';
import { ClientProjectVerifyRepository } from './repositories/clientProjectVerify.repository';
import { MailService } from '../mail/mail.service';
import { ReputationConstantModule } from '../reputationConstant/reputationConstant.module';
import { AdminSettingsModule } from '../adminSettings/adminSettings.module';
import { ReputationModule } from '../reputation/reputation.module';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { AppGateway } from '../../helpers/gateway/app.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AdminSettingsModule),
    forwardRef(() => ReputationModule),
    forwardRef(() => ReputationConstantModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([ClientProjectRepository]),
    TypeOrmModule.forFeature([ClientProjectVerifyRepository]),
    TypeOrmModule.forFeature([ProjectFileRepository]),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [ClientProjectController],
  providers: [ClientProjectService, LoggerService, MailService, AppGateway],
})
export class ClientProjectModule {}
