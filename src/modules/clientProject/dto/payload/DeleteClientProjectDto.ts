import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteClientProjectDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Client Project Id.',
  })
  readonly clientProjectId: string;
}
