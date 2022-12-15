import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { QuestionType } from '../enums/questionType.enum';
import { QuestionDto } from '../dto/QuestionDto';
import { AnswerEntity } from './answer.entity';

@Entity({ name: 'questions' })
export class QuestionEntity extends AbstractEntity<QuestionDto> {
  @Column()
  question: string;

  @Column()
  type: QuestionType;

  @Column()
  status: boolean;

  @Column()
  weightage: number;

  @Column({ nullable: true })
  parentQuestion: string;

  @Column({ nullable: true })
  fieldName: string;

  @OneToMany(() => AnswerEntity, (answers) => answers.question)
  answers: AnswerEntity;

  dtoClass = QuestionDto;
}
