import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { UserOtpRepository } from './repositories/userotp.repository';
import { S3Service } from '../../shared/providers/s3.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    TypeOrmModule.forFeature([ProfileRepository]),
    TypeOrmModule.forFeature([UserOtpRepository]),
    TypeOrmModule.forFeature([ConnectionInviteRepository]),
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, S3Service, LoggerService],
})
export class UserModule {}
