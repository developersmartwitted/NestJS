import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateEducationDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Education Id.',
  })
  readonly educationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Degree.',
  })
  readonly degree: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'School name.',
  })
  readonly school: string;

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
    description: 'Year in which degree completed.',
  })
  readonly year: string;
}
