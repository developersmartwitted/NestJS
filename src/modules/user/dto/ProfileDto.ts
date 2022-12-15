import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ProfileEntity } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';

export class ProfileDto extends AbstractDto {
  @ApiPropertyOptional({
    description: '({folder}/{fileName}) of image uploaded in s3 bucket.',
  })
  profileImage: string;

  @ApiPropertyOptional({
    description: 'Hourly rate in number.',
  })
  hourlyRate: number;

  @ApiPropertyOptional({
    description: 'About yourself.',
  })
  about: string;

  @ApiPropertyOptional({
    description: 'External link such as git link.',
  })
  externalLinks: string;

  @ApiPropertyOptional({
    description: 'User address info.',
  })
  address: string;

  @ApiPropertyOptional({
    description: 'User selected country State.',
  })
  state: string;

  @ApiPropertyOptional({
    description: 'Country.',
  })
  country: string;

  @ApiPropertyOptional({
    description: 'User phone number.',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Users personal website url.',
  })
  personalWebsite: string;

  @ApiPropertyOptional({
    description: 'User domain (Desination).',
  })
  domain: string;

  @ApiPropertyOptional({
    description: 'Users specific role.',
  })
  domainRole: string;

  @ApiPropertyOptional({
    description: 'Reputation score of the user',
  })
  reputationScore: number;

  @ApiPropertyOptional({
    type: () => UserEntity,
    description: 'User basic data',
  })
  user: UserEntity;

  constructor(profile: ProfileEntity) {
    super(profile);
    this.profileImage = profile.profileImage;
    this.hourlyRate = profile.hourlyRate;
    this.about = profile.about;
    this.externalLinks = profile.externalLinks;
    this.address = profile.address;
    this.state = profile.state;
    this.country = profile.country;
    this.phoneNumber = profile.phoneNumber;
    this.domain = profile.domain;
    this.domainRole = profile.domainRole;
    this.reputationScore = profile.reputationScore;
    this.personalWebsite = profile.personalWebsite;
  }
}
