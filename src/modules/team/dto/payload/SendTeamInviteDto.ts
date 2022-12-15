import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AddTeamInviteDto } from './AddTeamInviteDto';

export class SendTeamInviteDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Team Id.',
  })
  readonly teamId: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Array of AddTeamInviteDto data',
  })
  readonly inviteMembers: AddTeamInviteDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment for sending invites.',
  })
  readonly comment: string;
}
