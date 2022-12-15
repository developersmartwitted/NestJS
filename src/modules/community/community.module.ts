import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../../shared/providers/logger.service';
import { ConfigModule } from '../../shared/config/config.module';
import { ConfigService } from '../../shared/config/config.service';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { DiscourseService } from './providers/discourse.api';
import { DiscourseRepository } from './repositories/discourse.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscourseRepository]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.axiosConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, DiscourseService, LoggerService],
  exports: [CommunityService],
})
export class CommunityModule {}
