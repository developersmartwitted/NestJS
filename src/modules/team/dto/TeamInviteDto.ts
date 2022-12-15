import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { TeamEntity } from '../entities/team.entity';
import { TeamInviteEntity } from '../entities/teamInvite.entity';

export class TeamInviteDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Member first name',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Member last name',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Member email',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Member designation',
  })
  designation: string;

  @ApiPropertyOptional({
    description: 'Comment about the team',
  })
  comment: string;

  @ApiPropertyOptional({
    description: 'Team invite status, whether it is deactive or active',
  })
  status: boolean;

  @ApiPropertyOptional({
    description: 'True if team invitation accepted',
  })
  isVerified: boolean;

  @ApiPropertyOptional({ type: () => UserEntity })
  invitedBy: UserEntity;

  @ApiPropertyOptional({ type: () => UserEntity })
  verifier: UserEntity;

  @ApiPropertyOptional({ type: () => TeamEntity })
  team: TeamEntity;

  constructor(teamInvite: TeamInviteEntity) {
    super(teamInvite);
    this.firstName = teamInvite.firstName;
    this.lastName = teamInvite.lastName;
    this.email = teamInvite.email;
    this.designation = teamInvite.designation;
    this.status = teamInvite.status;
    this.isVerified = teamInvite.isVerified;
    this.comment = teamInvite.comment;
    this.invitedBy = teamInvite.invitedBy;
    this.verifier = teamInvite.verifier;
    this.team = teamInvite.team;
  }
}
