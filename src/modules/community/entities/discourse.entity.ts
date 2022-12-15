import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { DiscourseDto } from '../dto/DiscourseDto';

@Entity({ name: 'discourse' })
export class DiscourseEntity extends AbstractEntity<DiscourseDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column({ nullable: true })
  discourseId: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  approved: boolean;

  @Column()
  active: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = DiscourseDto;
}
