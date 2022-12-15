import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

import { Role } from '../../auth/enums/role.enum';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { UserOTPEntity } from '../entities/otp.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { SkillUserMapEntity } from '../../skill/entities/skillUserMap.entity';

export class UserDto extends AbstractDto {
  @ApiPropertyOptional({
    description: 'First Name can be maximum of 100 characters.',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Last Name can be maximum of 100 characters.',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email should be in valid email format.',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'Password must consist of one uppercase letter, one lowercase letter and one special character.',
    type: String,
  })
  password: string;

  @ApiProperty({
    enum: Role,
    default: [Role.USER],
    description: `String array, containing enum values, either ${Role.USER} or ${Role.ADMIN}`,
    type: String,
  })
  roles: Role;

  @ApiProperty({
    description: 'Defines if the user is active or not.',
  })
  @IsEmail()
  status: boolean;

  @ApiProperty({
    type: () => UserOTPEntity,
    description: 'Users email and sms otp and it is verification status',
  })
  userOtp: UserOTPEntity;

  @ApiProperty({
    type: () => ProfileEntity,
    description: 'Profile information.',
  })
  profile: ProfileEntity;

  @ApiProperty({
    type: () => SkillUserMapEntity,
    description: 'Users skill information.',
  })
  skills: SkillUserMapEntity;

  @ApiProperty({
    type: () => UserEntity,
    description: 'Users skill information.',
  })
  invitedBy: UserEntity | string;

  constructor(user: UserEntity) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.password = user.password;
    this.roles = user.roles;
    this.userOtp = user.userOtp;
    this.profile = user.profile;
    this.skills = user.skills;
    this.invitedBy = user.invitedBy;
  }
}
