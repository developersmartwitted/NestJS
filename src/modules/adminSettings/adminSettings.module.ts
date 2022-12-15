import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformSettingsRepository } from './repositories/platformSettings.repository';
import { AdminSettingsController } from './adminSettings.controller';
import { AdminSettingsService } from './adminSettings.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
  imports: [
    forwardRef(() => ReputationModule),
    TypeOrmModule.forFeature([PlatformSettingsRepository]),
  ],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, LoggerService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
