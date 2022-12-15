import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNumber, IsString, MinDate } from 'class-validator';
import moment from 'moment';

export class InvoicePayloadDto {
  @IsEmail()
  @ApiProperty({
    description: 'Email address to whome the invoice needs to be sent.',
  })
  readonly email: string;

  @IsNumber()
  @ApiProperty({
    description: 'Amount, which needs to be requested in invoice.',
  })
  readonly amount: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date(moment().add(1, 'days').format('YYYY-MM-DD')))
  @ApiProperty({
    description: 'Due date for the invoice. Must be greater than current date.',
    type: Date,
  })
  readonly dueDate: Date;

  @IsString()
  @ApiProperty({
    description: 'Comment, which needs to be added in invoice.',
  })
  readonly comment: string;
}
