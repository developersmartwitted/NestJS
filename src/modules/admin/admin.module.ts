import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([UserRepository]),
    TypeOrmModule.forFeature([ConnectionInviteRepository]),
  ],
  controllers: [AdminController],
  providers: [AdminService, LoggerService],
})
export class AdminModule {}
