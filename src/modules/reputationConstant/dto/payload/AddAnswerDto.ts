import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

import { AnswerType } from '../../enums/answerType.enum';

export class AddAnswerDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the question for which this answer needs to be added',
  })
  questionId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answer text',
  })
  answer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answer type, SKILLS, CLIENT_PROJECT or EMPLOYMENT',
  })
  answerType: AnswerType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answers  value',
  })
  value: number;
}
