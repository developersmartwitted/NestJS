import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserCountDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Total no of user',
  })
  total: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'No of user in last one month',
  })
  lastMonth: number;
}
