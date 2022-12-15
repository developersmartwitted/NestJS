import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

import { ProfileDto } from '../dto/ProfileDto';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_profile' })
export class ProfileEntity extends AbstractEntity<ProfileDto> {
  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  hourlyRate: number;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  externalLinks: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  personalWebsite: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true })
  domainRole: string;

  @Column('decimal', { nullable: true })
  reputationScore: number;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn()
  user: UserEntity;

  dtoClass = ProfileDto;
}
