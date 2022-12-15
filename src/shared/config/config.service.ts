import { Injectable } from '@nestjs/common/decorators/core';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as dotenv from 'dotenv';
import moment from 'moment';
import * as winston from 'winston';
import { StripeOptions } from 'nestjs-stripe';

import { SnakeNamingStrategy } from '../strategy/snake-naming.strategy';

@Injectable()
export class ConfigService {
  constructor() {
    const nodeEnv = this.nodeEnv;
    dotenv.config({
      path: `.${nodeEnv}.env`,
    });
    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  /** TypeORM configuration called in app module */
  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
    let migrations = [__dirname + '/../database/migrations/*{.ts,.js}'];

    if ((module as any).hot) {
      const entityContext = (require as any).context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);
        return entity;
      });
      const migrationContext = (require as any).context(
        './../../migrations',
        false,
        /\.ts$/,
      );
      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);
        return migration;
      });
    }
    return {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'postgres',
      synchronize: true,
      host: this.get('panoton-database.c2vbxsvg4fdp.us-east-1.rds.amazonaws.com'),
            port: this.getNumber('5432'),
            username: this.get('YJRatRwrkn'),
            password: this.get('UKRaSrcZMWJRyE7E'),
            database: this.get('panotondb'),
      migrationsRun: true,
      logging: this.nodeEnv === 'development',
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  /** Winston Logger configuration called in app module */
  get winstonLoggerConfig() {
    return {
      transports: [
        new winston.transports.File({
          filename: `${process.cwd()}/logs/log-${moment().format(
            'YYYY-MM-DD',
          )}.log`,
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
      ],
    };
  }

  /** Cors Configuration */
  get corsConfigOptions() {
    const allowedOrigins = [
      'https://www.panoton.com',
      'https://panoton.com',
      'https://api.panoton.com',
      'https://app.panoton.com',
    ];

    return {
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
      preflightContinue: false,
    };
  }

  /** Axios configuration for discourse */
  get axiosConfig() {
    return {
      baseURL: this.get('DISCOURSE_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.get('DISCOURSE_API_KEY'),
      },
      validateStatus: (status: number) => {
        return (status >= 200 && status < 300) || status == 404;
      },
    };
  }

  /** Stripe configuration */
  get stripeConfig(): StripeOptions {
    return {
      apiKey: this.get('STRIPE_SECRET_KEY'),
      apiVersion: '2020-08-27',
    };
  }
}
