import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { LoggerService } from '../../shared/providers/logger.service';
import { EducationRepository } from './repositories/education.repository';
import { CertificationRepository } from './repositories/certification.repository';
import { EducationFileRepository } from './repositories/educationFile.repository';
import { EducationService } from './education.service';
import { EducationController } from './education.cotroller';
import { AdminSettingsModule } from '../adminSettings/adminSettings.module';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AdminSettingsModule),
    forwardRef(() => ReputationModule),
    TypeOrmModule.forFeature([EducationRepository]),
    TypeOrmModule.forFeature([CertificationRepository]),
    TypeOrmModule.forFeature([EducationFileRepository]),
  ],
  controllers: [EducationController],
  providers: [EducationService, LoggerService],
})
export class EducationModule {}
