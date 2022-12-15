import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppGateway } from '../../helpers/gateway/app.gateway';
import { LoggerService } from '../../shared/providers/logger.service';
import { MailService } from '../mail/mail.service';
import { NotificationModule } from '../notification/notification.module';
import { SkillModule } from '../skill/skill.module';
import { UserModule } from '../user/user.module';
import { TeamRepository } from './repositories/team.repository';
import { TeamInviteRepository } from './repositories/teamInvite.repository';
import { TeamUserMapRepository } from './repositories/teamUserMap.repository';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => SkillModule),
    forwardRef(() => NotificationModule),
    TypeOrmModule.forFeature([TeamRepository]),
    TypeOrmModule.forFeature([TeamInviteRepository]),
    TypeOrmModule.forFeature([TeamUserMapRepository]),
  ],
  controllers: [TeamController],
  providers: [TeamService, LoggerService, MailService, AppGateway],
})
export class TeamModule {}
