import { Entity, Column, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { PlatformSettingsDto } from '../dto/PlatformSettingsDto';

@Entity({ name: 'platform_settings' })
export class PlatformSettingsEntity extends AbstractEntity<PlatformSettingsDto> {
  @ManyToOne(() => UserEntity, (user) => user.id)
  createdBy: UserEntity;

  @Column()
  invites: number;

  @Column()
  project: number;

  @Column()
  skills: number;

  @Column()
  education: number;

  @Column()
  certification: number;

  @Column()
  employment: number;

  @Column({ default: false })
  isDeleted: boolean;

  dtoClass = PlatformSettingsDto;
}
