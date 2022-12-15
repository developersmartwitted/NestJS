import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { ConfigService } from '../../shared/config/config.service';
import { ConfigModule } from '../../shared/config/config.module';
import { MailService } from './mail.service';
import { LoggerService } from '../../shared/providers/logger.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MailerOptions => {
        return {
          transport: {
            host: configService.get('EMAIL_HOST'),
            port: Number(configService.get('EMAIL_PORT')),
            auth: {
              user: configService.get('EMAIL_USERNAME'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: "'Panoton' <support@panoton.com>",
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService, LoggerService],
  exports: [MailService],
})
export class MailModule {}
