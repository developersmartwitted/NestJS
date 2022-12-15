import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { UserEntity } from '../../user/entities/user.entity';
import { ClientProjectEntity } from '../entities/clientProject.entity';
import { ClientProjectVerifyEntity } from '../entities/clientProjectVerify.entity';

export class ClientProjectVerifyDto extends AbstractDto {
  @ApiProperty({
    type: () => ClientProjectEntity,
    description: 'Client project id',
  })
  clientProject: ClientProjectEntity;

  @ApiProperty({ type: () => UserEntity, description: 'User id.' })
  user: UserEntity;

  @ApiProperty({ type: () => UserEntity, description: 'Verfied by user id.' })
  verifier: UserEntity;

  @ApiProperty({
    description: 'Verifiers first name.',
  })
  name: string;

  @ApiProperty({
    description: 'Project cost.',
  })
  cost: string;

  @ApiProperty({
    description: 'Verifiers email id, valid email format.',
  })
  email: string;

  @ApiProperty({
    description: 'Users comments for the verifier.',
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

  constructor(clientProjectVerify: ClientProjectVerifyEntity) {
    super(clientProjectVerify);
    this.clientProject = clientProjectVerify.clientProject;
    this.user = clientProjectVerify.user;
    this.verifier = clientProjectVerify.verifier;
    this.name = clientProjectVerify.name;
    this.cost = clientProjectVerify.cost;
    this.email = clientProjectVerify.email;
    this.isVerified = clientProjectVerify.isVerified;
    this.isDeleted = clientProjectVerify.isDeleted;
  }
}
