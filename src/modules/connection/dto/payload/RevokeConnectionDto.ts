import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeConnectionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Connection id',
  })
  readonly connectionId: string;
}
