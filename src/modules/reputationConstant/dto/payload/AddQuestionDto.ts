import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { QuestionType } from '../../enums/questionType.enum';

export class AddQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question text',
  })
  question: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question type, SKILLS, CLIENT_PROJECT or EMPLOYMENT',
  })
  questionType: QuestionType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question text',
  })
  weightage: number;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Parent question id for the sub question',
  })
  parentQuestionId: string;
}
