import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { ConnectionInviteEntity } from '../entities/connectionInvite.entity';
import { ConnectionType } from '../enums/connectionType.enum';

export class ConnectionInviteDto extends AbstractDto {
  @ApiPropertyOptional({ type: () => UserEntity })
  invitedBy: UserEntity;

  @ApiPropertyOptional({ type: () => UserEntity })
  user: UserEntity;

  @ApiPropertyOptional({
    description: 'Members first name',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Members last name',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Members phone number',
  })
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Vaild email id',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Comment',
  })
  comment: string;

  @ApiPropertyOptional({
    description: 'Invitation status, Accepted true not accpetped false',
  })
  status: boolean;

  @ApiPropertyOptional({
    description: 'Whether invited or accepted connection',
    enum: ConnectionType,
  })
  type: ConnectionType;

  @ApiPropertyOptional({
    description: 'Invitation status, whether it is deactive or active',
  })
  isDeleted: boolean;

  constructor(connectionInvite: ConnectionInviteEntity) {
    super(connectionInvite);
    this.firstName = connectionInvite.firstName;
    this.lastName = connectionInvite.lastName;
    this.lastName = connectionInvite.lastName;
    this.email = connectionInvite.email;
    this.comment = connectionInvite.comment;
    this.status = connectionInvite.status;
    this.type = connectionInvite.type;
    this.user = connectionInvite.user;
    this.isDeleted = connectionInvite.isDeleted;
    this.invitedBy = connectionInvite.invitedBy;
  }
}
