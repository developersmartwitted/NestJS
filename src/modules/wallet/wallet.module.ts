import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../../shared/providers/logger.service';
import { ClientProjectRepository } from '../clientProject/repositories/clientProject.repository';
import { CertificationRepository } from '../education/repositories/certification.repository';
import { EducationRepository } from '../education/repositories/education.repository';
import { EmploymentRepository } from '../employment/repositories/employment.repository';
import { SkillUserMapRepository } from '../skill/repositories/skillUserMap.repository';
import { UserModule } from '../user/user.module';
import { WalletRepository } from './repositories/wallet.repository';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      WalletRepository,
      SkillUserMapRepository,
      EmploymentRepository,
      EducationRepository,
      CertificationRepository,
      ClientProjectRepository,
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, LoggerService],
  exports: [WalletService],
})
export class WalletModule {}
