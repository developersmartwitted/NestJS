import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ClientProjectVerifyDto } from '../dto/ClientProjectVerifyDto';
import { ClientProjectEntity } from './clientProject.entity';

@Entity({ name: 'client_project_verification' })
export class ClientProjectVerifyEntity extends AbstractEntity<ClientProjectVerifyDto> {
  @ManyToOne(() => ClientProjectEntity, (employment) => employment.id)
  clientProject: ClientProjectEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  verifier: UserEntity;

  @Column()
  name: string;

  @Column()
  cost: string;

  @Column()
  email: string;

  @Column()
  comments: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = ClientProjectVerifyDto;
}
