import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AnswerListDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answer Id.',
  })
  readonly answerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Answer for the question.',
  })
  readonly answer: string;
}
