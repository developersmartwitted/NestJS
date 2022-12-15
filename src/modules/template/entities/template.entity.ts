import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { TemplateDto } from '../dto/TemplateDto';

@Entity({ name: 'templates' })
export class TemplateEntity extends AbstractEntity<TemplateDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  createdBy: UserEntity;

  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  publishedTitle: string;

  @Column({ nullable: true })
  publishedDescription: string;

  @Column({ nullable: true })
  lastPublisedAt: Date;

  @Column({ nullable: true })
  draftedTitle: string;

  @Column({ nullable: true })
  draftedDescription: string;

  @Column({ nullable: true })
  lastDraftedAt: Date;

  @Column({ default: true })
  status: boolean;

  dtoClass = TemplateDto;
}
