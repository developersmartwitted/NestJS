import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddCertificateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Certificate name.',
  })
  readonly certificate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Institution name.',
  })
  readonly institution: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded education file name.',
  })
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Uploaded education file location {folderName/filename.mimetype} .',
  })
  fileLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded file mimetype.',
  })
  fileMimeType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Year in which certification completed.',
  })
  readonly year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comments.',
  })
  readonly comments: string;
}
