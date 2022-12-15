import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  info(message: string, data?: any) {
    this.logger.info(`${message}, ${JSON.stringify(data)}`);
  }

  error(message: string, error?: any) {
    this.logger.error(`${message}, ${JSON.stringify(error)}`);
  }
}
