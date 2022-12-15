import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppGateway } from '../../helpers/gateway/app.gateway';
import { LoggerService } from '../../shared/providers/logger.service';
import { AdminSettingsModule } from '../adminSettings/adminSettings.module';
import { MailService } from '../mail/mail.service';
import { NotificationModule } from '../notification/notification.module';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { ReputationModule } from '../reputation/reputation.module';
import { ReputationConstantModule } from '../reputationConstant/reputationConstant.module';
import { UserModule } from '../user/user.module';
import { SkillRepository } from './repositories/skill.repository';
import { SkillMapRepository } from './repositories/skillMap.repository';
import { SkillUserMapRepository } from './repositories/skillUserMap.repository';
import { SkillVerificationRepository } from './repositories/skillVerification.repository';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ReputationConstantModule),
    forwardRef(() => AdminSettingsModule),
    forwardRef(() => ReputationModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([SkillRepository]),
    TypeOrmModule.forFeature([SkillMapRepository]),
    TypeOrmModule.forFeature([SkillUserMapRepository]),
    TypeOrmModule.forFeature([SkillVerificationRepository]),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [SkillController],
  providers: [SkillService, LoggerService, MailService, AppGateway],
  exports: [SkillService],
})
export class SkillModule {}
