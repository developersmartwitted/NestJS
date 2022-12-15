import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { AnswerEntity } from '../entities/answer.entity';
import { QuestionEntity } from '../entities/question.entity';
import { UserAnswerMapEntity } from '../entities/userAnswerMap.entity';
import { AnswerType } from '../enums/answerType.enum';
import { QuestionType } from '../enums/questionType.enum';

export class UserAnswerMapDto extends AbstractDto {
  @ApiProperty({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  invitedBy: UserEntity;

  @ApiProperty({
    description: 'UserId of the user who has add the education.',
    type: () => UserEntity,
  })
  verifiedBy: UserEntity;

  @ApiProperty({
    description: 'UserId of the user who has add the education.',
    type: () => QuestionEntity,
  })
  question: QuestionEntity;

  @ApiProperty({
    description: 'UserId of the user who has add the education.',
    type: () => AnswerEntity,
  })
  answer: AnswerEntity;

  @ApiPropertyOptional({
    description: 'Question text',
  })
  value: number;

  @ApiPropertyOptional({
    description: 'AnswerType',
  })
  answerType: AnswerType;

  @ApiPropertyOptional({
    description: 'QuestionType',
  })
  questionType: QuestionType;

  @ApiPropertyOptional({
    description: 'Verification Id',
  })
  verificationId: string;

  @ApiProperty({
    description: 'Question status',
  })
  isNps: boolean;

  @ApiProperty({
    description: 'Question type',
  })
  status: boolean;

  constructor(userAnswer: UserAnswerMapEntity) {
    super(userAnswer);
    this.invitedBy = userAnswer.invitedBy;
    this.verifiedBy = userAnswer.verifiedBy;
    this.question = userAnswer.question;
    this.questionType = userAnswer.questionType;
    this.answer = userAnswer.answer;
    this.answerType = userAnswer.answerType;
    this.answer = userAnswer.answer;
    this.verificationId = userAnswer.verificationId;
    this.value = userAnswer.value;
    this.isNps = userAnswer.isNps;
    this.status = userAnswer.status;
  }
}
