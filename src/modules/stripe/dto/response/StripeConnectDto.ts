import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StripeConnectDto {
  @IsString()
  @ApiProperty({
    description: 'Url to be redirected, where user can create account.',
  })
  readonly link: string;
}
