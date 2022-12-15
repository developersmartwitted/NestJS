import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project id in which is to applied.',
  })
  readonly projectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Any message which is to be shared with the project owner while applying.',
  })
  readonly message: string;
}
