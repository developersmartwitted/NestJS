import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { AnswerEntity } from '../entities/answer.entity';
import { QuestionEntity } from '../entities/question.entity';
import { QuestionType } from '../enums/questionType.enum';

export class QuestionDto extends AbstractDto {
  @ApiProperty({
    description: 'Question text',
  })
  question: string;

  @ApiProperty({
    description: 'Question status',
  })
  status: boolean;

  @ApiProperty({
    description: 'Question type',
  })
  type: QuestionType;

  @ApiProperty({
    description: 'Question weightage percentage',
  })
  weightage: number;

  @ApiProperty({
    description: 'Name of the filed to identify in form',
  })
  fieldName: string;

  @ApiPropertyOptional({
    description: 'Answers for the given questions',
    type: () => AnswerEntity,
  })
  answers: AnswerEntity;

  @ApiProperty({
    description: 'Parent question id for the sub question',
  })
  parentQuestion: string;

  constructor(questionEntity: QuestionEntity) {
    super(questionEntity);
    this.question = questionEntity.question;
    this.status = questionEntity.status;
    this.type = questionEntity.type;
    this.weightage = questionEntity.weightage;
    this.answers = questionEntity.answers;
    this.fieldName = questionEntity.fieldName;
    this.parentQuestion = questionEntity.parentQuestion;
  }
}
