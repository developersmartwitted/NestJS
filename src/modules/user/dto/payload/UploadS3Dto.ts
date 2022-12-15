import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadS3Dto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Mime type of the file, it can be jpg, png etc.',
  })
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Name of the folder in which the file needs to be uploaded in s3 (ex: "profile")',
  })
  folderName: string;
}
