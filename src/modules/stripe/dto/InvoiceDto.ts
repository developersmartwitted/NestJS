import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { InvoiceEntity } from '../entities/invoice.entity';

export class InvoiceDto extends AbstractDto {
  @ApiProperty({
    type: () => UserEntity,
    description: 'User id.',
  })
  user: UserEntity;

  @ApiProperty({
    description: 'Stripe invoice id.',
  })
  invoiceId: string;

  @ApiProperty({
    description: 'Stripe customer id.',
  })
  customerId: string;

  @ApiProperty({
    description: 'Email id to whome the invoice is sent.',
  })
  email: string;

  @ApiProperty({
    description: 'Amount which needs to requested in invoice',
  })
  amount: number;

  @ApiProperty({
    description: 'Due date for invoice',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Comment to shown in invoice',
  })
  comment: string;

  @ApiProperty({
    description:
      'Status of the invoice paid or not paiad, default set to false',
  })
  status: boolean;

  @ApiProperty({
    description: 'If invoice is deleted it is set  to true',
  })
  isDeleted: boolean;

  constructor(invoice: InvoiceEntity) {
    super(invoice);
    this.user = invoice.user;
    this.invoiceId = invoice.invoiceId;
    this.email = invoice.email;
    this.amount = invoice.amount;
    this.dueDate = invoice.dueDate;
    this.comment = invoice.comment;
    this.status = invoice.status;
    this.isDeleted = invoice.isDeleted;
  }
}
