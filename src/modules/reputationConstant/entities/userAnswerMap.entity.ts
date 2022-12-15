import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { AnswerEntity } from './answer.entity';
import { QuestionEntity } from './question.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AnswerType } from '../enums/answerType.enum';
import { UserAnswerMapDto } from '../dto/UserAnswerMapDto';
import { QuestionType } from '../enums/questionType.enum';

@Entity({ name: 'user_answer_map' })
export class UserAnswerMapEntity extends AbstractEntity<UserAnswerMapDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  invitedBy: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  verifiedBy: UserEntity;

  @ManyToOne(() => QuestionEntity, (question) => question.id)
  question: QuestionEntity;

  @ManyToOne(() => AnswerEntity, (answers) => answers.id)
  answer: AnswerEntity;

  @Column({ nullable: true })
  questionType: QuestionType;

  @Column({ nullable: true })
  verificationId: string;

  @Column()
  answerType: AnswerType;

  @Column({ nullable: true })
  value: number;

  @Column({ default: false })
  isNps: boolean;

  @Column({ default: true })
  status: boolean;

  dtoClass = UserAnswerMapDto;
}
