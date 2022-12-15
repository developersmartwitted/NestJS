import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RemoveProjectMemberDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Id.',
  })
  readonly projectId: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'Members name.',
  })
  readonly memberId: string;
}
