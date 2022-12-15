import { Injectable } from '@nestjs/common';
import SNS from 'aws-sdk/clients/sns';

import { ConfigService } from '../config/config.service';
import { LoggerService } from './logger.service';

@Injectable()
export class SMSService {
  constructor(
    private readonly configService: ConfigService,
    private logger: LoggerService,
  ) {}

  /**
   * @description Sends sms to the given phone number using sns
   * @param smsData { message: message body which needs to be sent; phoneNumber: ph no to which sms needs to be sent }
   */
  async sendSms(smsData: { message: string; phoneNumber: string }) {
    const logger = this.logger;
    const { message, phoneNumber } = smsData;
    const snsConfig = {
      apiVersion: '2010-03-31',
      region: this.configService.get('AWS_DEFAULT_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    };

    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.MM.SMS.OriginationNumber': {
          DataType: 'String',
          StringValue: '+19705784866', // origination number should be in E.164 format
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };
    const publishTextPromise = new SNS(snsConfig).publish(params).promise();

    publishTextPromise
      .then(function (data) {
        logger.info(`SMS OTP is sent to ${phoneNumber} : `, { data });
      })
      .catch(function (err) {
        logger.error(`Error while sending otp sms to ${phoneNumber} : `, {
          error: err,
        });
      });
  }
}
