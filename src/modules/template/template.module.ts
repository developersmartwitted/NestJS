import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../../shared/providers/logger.service';
import { UserModule } from '../user/user.module';
import { TemplateRepository } from './repositories/template.repository';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([TemplateRepository]),
  ],
  controllers: [TemplateController],
  providers: [TemplateService, LoggerService],
})
export class TemplateModule {}
