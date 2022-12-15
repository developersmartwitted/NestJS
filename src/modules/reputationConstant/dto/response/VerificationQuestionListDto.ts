import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { AnswerType } from '../../enums/answerType.enum';
import { AnswerListDto } from './AnswerListDto';

export class VerificationQuestionListDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question Id.',
  })
  readonly questionId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question.',
  })
  readonly question: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question created at date time.',
  })
  readonly createdAt: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answer type for question (RATING or DROPDOWN etc).',
    type: AnswerType,
  })
  readonly answerType: string;

  @IsString()
  @ApiProperty({
    description: 'Name of the filed to identify in form',
  })
  readonly fieldName: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answers array.',
    type: AnswerListDto,
  })
  readonly answers: AnswerListDto[];

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Array of subquestions.',
    type: VerificationQuestionListDto,
  })
  readonly subQuestions: VerificationQuestionListDto[];
}
