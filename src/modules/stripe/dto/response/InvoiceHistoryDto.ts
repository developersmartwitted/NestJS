import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InvoiceHistoryDto {
  @IsString()
  @ApiProperty({
    description: 'userId.',
  })
  readonly userId: string;

  @IsString()
  @ApiProperty({
    description: 'InvoiceId.',
  })
  readonly invoiceId: string;

  @IsString()
  @ApiProperty({
    description: 'stripeInvoiceId.',
  })
  readonly stripeInvoiceId: string;

  @IsString()
  @ApiProperty({
    description: 'customerId.',
  })
  readonly customerId: string;

  @IsString()
  @ApiProperty({
    description: 'email.',
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'due date of invoice.',
  })
  readonly dueDate: string;

  @IsString()
  @ApiProperty({
    description: 'date at which the invoice is created.',
  })
  readonly createdAt: string;

  @IsString()
  @ApiProperty({
    description: 'ammount.',
  })
  readonly amount: string;

  @IsString()
  @ApiProperty({
    description: 'comment.',
  })
  readonly comment: string;

  @IsString()
  @ApiProperty({
    description: 'status.',
  })
  readonly status: string;
}
