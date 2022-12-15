import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { TeamEntity } from '../entities/team.entity';
import { SkillMapEntity } from '../../skill/entities/skillMap.entity';
import { TeamUserMapEntity } from '../entities/teamUserMap.entity';

export class TeamDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'Team name',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Team description',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Team profile image name',
  })
  profileImageName: string;

  @ApiPropertyOptional({
    description:
      'Team profile image location (i.e) Uploaded file location {folderName/filename.mimetype}.',
  })
  profileImageLocation: string;

  @ApiPropertyOptional({
    description: 'Team profile image mime type',
  })
  profileImageMimeType: string;

  @ApiPropertyOptional({
    description: 'Team status, whether team is delete or active',
  })
  status: boolean;

  @ApiPropertyOptional({ type: () => SkillMapEntity })
  skills: SkillMapEntity;

  @ApiPropertyOptional({ type: () => UserEntity })
  user: UserEntity;

  @ApiPropertyOptional({ type: () => TeamUserMapEntity })
  teamMap: TeamUserMapEntity;

  constructor(team: TeamEntity) {
    super(team);
    this.name = team.name;
    this.description = team.description;
    this.profileImageName = team.profileImageName;
    this.profileImageLocation = team.profileImageLocation;
    this.profileImageMimeType = team.profileImageMimeType;
    this.status = team.status;
    this.user = team.user;
    this.skills = team.skills;
    this.teamMap = team.teamMap;
  }
}
