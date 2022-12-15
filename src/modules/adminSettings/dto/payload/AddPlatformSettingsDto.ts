import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddPlatformSettingsDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of invites can be sent per user.',
  })
  invites: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of projects created per user.',
  })
  project: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of skills can be added per user.',
  })
  skills: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of education can be added per user.',
  })
  education: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of certification can be added per user.',
  })
  certification: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of employment can be added per user.',
  })
  employment: number;
}
