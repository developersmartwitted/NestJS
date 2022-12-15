import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  raw: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Category Id to create topic in',
  })
  categoryId: number;

  @IsArray()
  @IsOptional()
  @IsNotEmpty()
  tags: string[];
}
