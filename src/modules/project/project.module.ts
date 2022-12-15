import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectFileRepository } from './repositories/projectFile.repository';
import { ProjectRepository } from './repositories/project.repository';
import { UserModule } from '../user/user.module';
import { SkillModule } from '../skill/skill.module';
import { LoggerService } from '../../shared/providers/logger.service';
import { ProjectUserMapRepository } from './repositories/projectUserMap.repository';
import { ProjectInviteRepository } from './repositories/projectInvite.repository';
import { MailService } from '../mail/mail.service';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { AppGateway } from '../../helpers/gateway/app.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => SkillModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([ProjectRepository]),
    TypeOrmModule.forFeature([ProjectFileRepository]),
    TypeOrmModule.forFeature([ProjectUserMapRepository]),
    TypeOrmModule.forFeature([ProjectInviteRepository]),
    TypeOrmModule.forFeature([NotificationRepository]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, LoggerService, MailService, AppGateway],
})
export class ProjectModule {}
