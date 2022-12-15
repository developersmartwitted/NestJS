import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlatformSettingsRepository } from '../adminSettings/repositories/platformSettings.repository';
import { ClientProjectRepository } from '../clientProject/repositories/clientProject.repository';
import { ClientProjectVerifyRepository } from '../clientProject/repositories/clientProjectVerify.repository';
import { CertificationRepository } from '../education/repositories/certification.repository';
import { EducationRepository } from '../education/repositories/education.repository';
import { EmploymentRepository } from '../employment/repositories/employment.repository';
import { ReputationWeightRepository } from '../reputationConstant/repositories/reputationWeight.repository';
import { UserAnswerMapRepository } from '../reputationConstant/repositories/userAnswerMap.repository';
import { SkillUserMapRepository } from '../skill/repositories/skillUserMap.repository';
import { SkillVerificationRepository } from '../skill/repositories/skillVerification.repository';
import { ProfileRepository } from '../user/repositories/profile.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { KYCService } from './parameters/kyc.service';
import { NPSService } from './parameters/npsService';
import { PeerRatingService } from './parameters/peerRating.service';
import { RevenueScoreService } from './parameters/revenueScoreService';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './reputation.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { AppGateway } from '../../helpers/gateway/app.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      ProfileRepository,
      ReputationWeightRepository,
      PlatformSettingsRepository,
      SkillUserMapRepository,
      SkillVerificationRepository,
      ClientProjectRepository,
      EducationRepository,
      CertificationRepository,
      EmploymentRepository,
      UserAnswerMapRepository,
      ClientProjectVerifyRepository,
    ]),
  ],
  controllers: [ReputationController],
  providers: [
    ReputationService,
    KYCService,
    PeerRatingService,
    NPSService,
    RevenueScoreService,
    LoggerService,
    AppGateway,
  ],
  exports: [ReputationService],
})
export class ReputationModule {}
