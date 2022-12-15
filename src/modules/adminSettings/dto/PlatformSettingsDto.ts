import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { PlatformSettingsEntity } from '../entities/platformSettings.entity';

export class PlatformSettingsDto extends AbstractDto {
  @ApiProperty({
    type: () => UserEntity,
    description: 'User id, who has created the record.',
  })
  createdBy: UserEntity;

  @ApiProperty({
    description: 'Number of invites can be sent per user.',
  })
  invites: number;

  @ApiProperty({
    description: 'Number of projects created per user.',
  })
  project: number;

  @ApiProperty({
    description: 'Number of skills can be added per user.',
  })
  skills: number;

  @ApiProperty({
    description: 'Number of education can be added per user.',
  })
  education: number;

  @ApiProperty({
    description: 'Number of certification can be added per user.',
  })
  certification: number;

  @ApiProperty({
    description: 'Number of employment can be added per user.',
  })
  employment: number;

  @ApiProperty({
    description: 'True if the platform setting is deleted.',
  })
  isDeleted: boolean;

  constructor(platformSettings: PlatformSettingsEntity) {
    super(platformSettings);
    this.createdBy = platformSettings.createdBy;
    this.invites = platformSettings.invites;
    this.project = platformSettings.project;
    this.skills = platformSettings.skills;
    this.education = platformSettings.education;
    this.certification = platformSettings.certification;
    this.employment = platformSettings.employment;
    this.isDeleted = platformSettings.isDeleted;
  }
}
