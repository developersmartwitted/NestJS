import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteEducationDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Education Id.',
  })
  readonly educationId: string;
}
