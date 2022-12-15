import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { AnswerDto } from '../dto/Answer.dto';
import { AnswerType } from '../enums/answerType.enum';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'answers' })
export class AnswerEntity extends AbstractEntity<AnswerDto> {
  @ManyToOne(() => QuestionEntity, (questions) => questions.id)
  question: QuestionEntity;

  @Column()
  answer: string;

  @Column({ default: 0 })
  value: number;

  @Column({ default: 0 })
  weight: number;

  @Column()
  type: AnswerType;

  @Column({ default: true })
  status: boolean;

  dtoClass = AnswerDto;
}
