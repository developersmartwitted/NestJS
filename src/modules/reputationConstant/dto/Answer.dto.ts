import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { AnswerEntity } from '../entities/answer.entity';
import { AnswerType } from '../enums/answerType.enum';

export class AnswerDto extends AbstractDto {
  @ApiProperty({
    description: 'Answer text',
  })
  answer: string;

  @ApiProperty({
    description: 'Answer value',
  })
  value: number;

  @ApiProperty({
    description: 'Answers weightage with in 100',
  })
  weight: number;

  @ApiProperty({
    description: 'Answer type',
    enum: AnswerType,
  })
  type: AnswerType;

  @ApiProperty({
    description: 'Status of the answer',
  })
  status: boolean;

  constructor(answerEntity: AnswerEntity) {
    super(answerEntity);
    this.answer = answerEntity.answer;
    this.value = answerEntity.value;
    this.type = answerEntity.type;
    this.status = answerEntity.status;
  }
}
