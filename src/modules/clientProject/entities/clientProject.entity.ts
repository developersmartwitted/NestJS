import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ClientProjectDto } from '../dto/ClientProjectDto';
import { ProjectFileEntity } from '../../project/entities/projectFile.entity';
import { ClientProjectVerifyEntity } from './clientProjectVerify.entity';

@Entity({ name: 'client_project' })
export class ClientProjectEntity extends AbstractEntity<ClientProjectDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  logoName: string;

  @Column()
  logoLocation: string;

  @Column()
  logoMimeType: string;

  @OneToMany(
    () => ProjectFileEntity,
    (projectFiles) => projectFiles.clientProject,
  )
  file: ProjectFileEntity;

  @OneToMany(
    () => ClientProjectVerifyEntity,
    (clientProjectVerify) => clientProjectVerify.clientProject,
  )
  clientProjectVerify: ClientProjectVerifyEntity;

  @Column()
  description: string;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = ClientProjectDto;
}
