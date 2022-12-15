import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddProjectFileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'File Name.',
    type: 'string',
  })
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded file location {folderName/filename.mimetype} .',
    type: 'string',
  })
  fileLocation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Uploaded file mimetype.',
    type: 'string',
  })
  fileMimeType: string;
}
