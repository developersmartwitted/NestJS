import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { UserEntity } from '../../user/entities/user.entity';
import { EmploymentEntity } from '../entities/employment.entity';
import { EmploymentVerificationEntity } from '../entities/employmentVerification.entity';

export class EmploymentVerificationDto extends AbstractDto {
  @ApiProperty({ type: () => EmploymentEntity, description: 'Employment id' })
  employment: EmploymentEntity;

  @ApiProperty({ type: () => UserEntity, description: 'User id.' })
  user: UserEntity;

  @ApiProperty({ type: () => UserEntity, description: 'Verfied by user id.' })
  verifier: UserEntity;

  @ApiProperty({
    description: 'Verifiers first name.',
  })
  firstName: string;

  @ApiProperty({
    description: 'Verifiers last name.',
  })
  lastName: string;

  @ApiProperty({
    description: 'Verifiers email id, valid email format.',
  })
  email: string;

  @ApiProperty({
    description: 'Verifiers role (desgination)',
  })
  role: string;

  @ApiProperty({
    description: 'Verifiers comments',
  })
  comments: string;

  @ApiProperty({
    description: 'True if the skill is verified, else false.',
  })
  isVerified: boolean;

  @ApiProperty({
    description:
      'Defines whether it is active or not. If true then it is active else inactive.',
  })
  isDeleted: boolean;

  constructor(employmentVerification: EmploymentVerificationEntity) {
    super(employmentVerification);
    this.employment = employmentVerification.employment;
    this.user = employmentVerification.user;
    this.verifier = employmentVerification.verifier;
    this.firstName = employmentVerification.firstName;
    this.lastName = employmentVerification.lastName;
    this.email = employmentVerification.email;
    this.role = employmentVerification.role;
    this.isVerified = employmentVerification.isVerified;
    this.isDeleted = employmentVerification.isDeleted;
  }
}
