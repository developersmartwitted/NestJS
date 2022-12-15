import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { config, S3 } from 'aws-sdk';

import { ConfigService } from '../config/config.service';
import { UploadS3Dto } from '../../modules/user/dto/payload/UploadS3Dto';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  async generateUploadUrl(uploadDto: UploadS3Dto) {
    const rawBytes = randomBytes(16);
    const imageName = `${uploadDto.folderName}/${rawBytes.toString('hex')}.${
      uploadDto.mimeType
    }`;

    config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_DEFAULT_REGION'),
      signatureVersion: 'v4',
    });

    const s3 = new S3();
    return await s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      Key: imageName,
      Expires: 60, //One min
    });
  }
}
