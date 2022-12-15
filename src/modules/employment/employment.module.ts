import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { EmploymentRepository } from './repositories/employment.repository';
import { EmploymentController } from './employment.controller';
import { EmploymentService } from './employment.service';
import { MailService } from '../mail/mail.service';
import { EmploymentVerificationRepository } from './repositories/employmentVerification.repository';
import { ReputationConstantModule } from '../reputationConstant/reputationConstant.module';
import { ReputationModule } from '../reputation/reputation.module';
import { AdminSettingsModule } from '../adminSettings/adminSettings.module';
import { AppGateway } from '../../helpers/gateway/app.gateway';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ReputationConstantModule),
    forwardRef(() => AdminSettingsModule),
    forwardRef(() => ReputationModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([EmploymentRepository]),
    TypeOrmModule.forFeature([EmploymentVerificationRepository]),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [EmploymentController],
  providers: [EmploymentService, MailService, AppGateway, LoggerService],
})
export class EmploymentModule {}
