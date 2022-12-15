import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectInviteEntity } from '../entities/projectInvite.entity';

export class ProjectInviteDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Member first name',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Member last name',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Comment about the team',
  })
  comment: string;

  @ApiPropertyOptional({
    description: 'Array of skill name',
  })
  skills: string;

  @ApiPropertyOptional({
    description: 'Project invite status, whether it is deactive or active',
  })
  status: boolean;
  @ApiPropertyOptional({
    description: 'True if project invitation accepted',
  })
  isVerified: boolean;

  @ApiPropertyOptional({ type: () => UserEntity })
  invitedBy: UserEntity;

  @ApiPropertyOptional({ type: () => ProjectEntity })
  project: ProjectEntity;

  @ApiPropertyOptional({ type: () => UserEntity })
  verifier: UserEntity;

  constructor(projectInvite: ProjectInviteEntity) {
    super(projectInvite);
    this.name = projectInvite.name;
    this.email = projectInvite.email;
    this.status = projectInvite.status;
    this.comment = projectInvite.comment;
    this.invitedBy = projectInvite.invitedBy;
    this.verifier = projectInvite.verifier;
    this.isVerified = projectInvite.isVerified;
    this.project = projectInvite.project;
  }
}
