import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { DiscourseEntity } from '../entities/discourse.entity';

export class DiscourseDto extends AbstractDto {
  @ApiProperty({
    description: 'UserId of the user whose discourse account is created.',
    type: () => UserEntity,
  })
  user: UserEntity;

  @ApiProperty({
    description: 'Discourse id',
  })
  discourseId: number;

  @ApiProperty({
    description:
      'Email id of the user using which the discourse account is created.',
  })
  email: string;

  @ApiProperty({
    description: 'Name on discourse account .',
  })
  name: string;

  @ApiProperty({
    description: 'Discourse username .',
  })
  username: string;

  @ApiProperty({
    description: 'Discourse password.',
  })
  password: string;

  @ApiProperty({
    description: 'Discourse account approved status',
  })
  approved: boolean;

  @ApiProperty({
    description: 'Discourse  account status.',
  })
  active: boolean;

  @ApiProperty({
    description: 'True if account is deleted',
  })
  isDeleted: boolean;

  constructor(discourse: DiscourseEntity) {
    super(discourse);
    this.user = discourse.user;
    this.discourseId = discourse.discourseId;
    this.email = discourse.email;
    this.username = discourse.username;
    this.password = discourse.password;
    this.approved = discourse.approved;
    this.active = discourse.active;
    this.isDeleted = discourse.isDeleted;
  }
}
