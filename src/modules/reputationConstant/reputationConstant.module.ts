import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { LoggerService } from '../../shared/providers/logger.service';
import { ReputationConstantService } from './reputationConstant.service';
import { ReputationConstantController } from './reputationConstant.controller';
import { ReputationWeightRepository } from './repositories/reputationWeight.repository';
import { QuestionRepository } from './repositories/question.repository';
import { AnswerRepository } from './repositories/answer.repository';
import { UserAnswerMapRepository } from './repositories/userAnswerMap.repository';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ReputationModule),
    TypeOrmModule.forFeature([ReputationWeightRepository]),
    TypeOrmModule.forFeature([QuestionRepository]),
    TypeOrmModule.forFeature([AnswerRepository]),
    TypeOrmModule.forFeature([UserAnswerMapRepository]),
  ],
  controllers: [ReputationConstantController],
  providers: [ReputationConstantService, LoggerService],
  exports: [ReputationConstantService],
})
export class ReputationConstantModule {}
