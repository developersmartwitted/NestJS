import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { SkillPayloadDto } from './SkillPayloadDto';

export class AddUserSkillDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the skill.',
  })
  readonly domain: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the skill.',
  })
  readonly role: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Atleast one skill needs to be added' })
  @ArrayMaxSize(3, { message: 'Sorry, you can not add more than 3 skills' })
  @ApiProperty({
    description: 'Name of the skill.',
  })
  readonly skills: SkillPayloadDto[];
}
