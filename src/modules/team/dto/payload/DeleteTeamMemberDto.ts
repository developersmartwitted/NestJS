import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTeamMemberDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'Team id',
  })
  readonly teamId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team member id',
  })
  readonly teamMemberId: string;
}
