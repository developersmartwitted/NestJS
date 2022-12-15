import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project id in which is to applied.',
  })
  readonly projectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Users id, whose application to be accpeted.',
  })
  readonly memberId: string;
}
