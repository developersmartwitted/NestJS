import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { InvoiceDto } from '../dto/InvoiceDto';

@Entity({ name: 'invoices' })
export class InvoiceEntity extends AbstractEntity<InvoiceDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  invoiceId: string;

  @Column()
  customerId: string;

  @Column()
  email: string;

  @Column('decimal')
  amount: number;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  comment: string;

  @Column({ default: false })
  status: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = InvoiceDto;
}
