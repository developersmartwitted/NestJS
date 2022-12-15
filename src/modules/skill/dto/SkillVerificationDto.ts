import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { SkillEntity } from '../entities/skill.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { SkillUserMapEntity } from '../entities/skillUserMap.entity';
import { SkillVerificationEntity } from '../entities/skillVerification.entity';

export class SkillVerificationDto extends AbstractDto {
  @ApiProperty({ type: () => SkillEntity, description: 'Skill id' })
  skill: SkillEntity;

  @ApiProperty({ type: () => SkillUserMapEntity, description: 'Skill id' })
  skillUserMap: SkillUserMapEntity;

  @ApiProperty({ type: () => UserEntity, description: 'User id.' })
  user: UserEntity;

  @ApiProperty({ type: () => UserEntity, description: 'Verfied by user id.' })
  verifier: UserEntity;

  @ApiProperty({
    description: 'Member name.',
  })
  name: string;

  @ApiProperty({
    description: 'Email, valid email format.',
  })
  email: string;

  @ApiProperty({
    description: 'Designation of the member.',
  })
  role: string;

  @ApiProperty({
    description: 'True if the skill is verified, else false.',
  })
  isVerified: boolean;

  @ApiProperty({
    description:
      'Defines whether it is active or not. If true then it is active else inactive.',
  })
  status: boolean;

  constructor(skillVerification: SkillVerificationEntity) {
    super(skillVerification);
    this.skill = skillVerification.skill;
    this.user = skillVerification.user;
    this.skillUserMap = skillVerification.skillUserMap;
    this.name = skillVerification.name;
    this.email = skillVerification.email;
    this.role = skillVerification.role;
    this.isVerified = skillVerification.isVerified;
    this.status = skillVerification.status;
  }
}
