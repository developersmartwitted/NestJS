import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerService } from '../../shared/providers/logger.service';
import { ConfigService } from '../../shared/config/config.service';
import { MailService } from '../mail/mail.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refreshToken.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SMSService } from '../../shared/providers/sms.service';
import { RefreshTokenService } from './refresh/refreshToken.service';
import { NotificationModule } from '../notification/notification.module';
import { ReputationModule } from '../reputation/reputation.module';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => ReputationModule),
    forwardRef(() => CommunityModule),
    TypeOrmModule.forFeature([RefreshTokenRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    RefreshTokenService,
    JwtStrategy,
    MailService,
    LoggerService,
    SMSService,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
