import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';

import { ReputationWeightEntity } from '../entities/reputationWeight.entity';

export class ReputationWeightDto extends AbstractDto {
  @ApiProperty({
    description: 'UserId who has created the record.',
    type: () => UserEntity,
  })
  createdBy: UserEntity;

  @ApiProperty({
    description: 'Basic KYC percentage.',
  })
  basicKyc: number;

  @ApiProperty({
    description: 'Advance KYC percentage.',
  })
  advanceKyc: number;

  @ApiProperty({
    description: 'Skill rating percentage.',
  })
  skillRating: number;

  @ApiProperty({
    description: 'Skills percentage.',
  })
  skills: number;

  @ApiProperty({
    description: 'Education percentage.',
  })
  education: number;

  @ApiProperty({
    description: 'Certificate percentage.',
  })
  certification: number;

  @ApiProperty({
    description: 'Client project percentage.',
  })
  clientProject: number;

  @ApiProperty({
    description: 'Employment history percentage.',
  })
  employmentHistory: number;

  constructor(repuationWeight: ReputationWeightEntity) {
    super(repuationWeight);
    this.createdBy = repuationWeight.createdBy;
    this.basicKyc = repuationWeight.basicKyc;
    this.advanceKyc = repuationWeight.advanceKyc;
    this.skillRating = repuationWeight.skillRating;
    this.skills = repuationWeight.skills;
    this.education = repuationWeight.education;
    this.certification = repuationWeight.certification;
    this.clientProject = repuationWeight.clientProject;
    this.employmentHistory = repuationWeight.employmentHistory;
  }
}
