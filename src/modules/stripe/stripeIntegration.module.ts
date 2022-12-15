import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoiceRepository } from './repositories/invoice.repository';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { StripeModule } from 'nestjs-stripe';
import { StripeAccountRepository } from './repositories/stripeAccount.repository';
import { ConfigService } from '../../shared/config/config.service';
import { ConfigModule } from '../../shared/config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceRepository]),
    TypeOrmModule.forFeature([StripeAccountRepository]),
    StripeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.stripeConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [StripeController],
  providers: [StripeService, LoggerService],
})
export class StripeIntegrationModule {}
