import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class S3UploadDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Presigned s3 url genrated with unique filename for given mime type and folder.',
  })
  readonly s3UploadUrl: string;
}
