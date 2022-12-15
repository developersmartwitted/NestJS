import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { Entity, Column, OneToOne, OneToMany, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

import { PasswordTransformer } from '../transformer/password.transformer';
import { UserDto } from '../dto/UserDto';
import { UserOTPEntity } from './otp.entity';
import { ProfileEntity } from './profile.entity';
import { Role } from '../../auth/enums/role.enum';
import { SkillUserMapEntity } from '../../skill/entities/skillUserMap.entity';
import { DiscourseEntity } from '../../community/entities/discourse.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({
    nullable: true,
    transformer: new PasswordTransformer(),
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column('enum', {
    array: true,
    enum: Role,
    default: `{${Role.USER}}`,
  })
  roles: Role;

  @OneToMany(() => SkillUserMapEntity, (skills) => skills.user)
  skills: SkillUserMapEntity;

  @Column({ default: true })
  status: boolean;

  @OneToOne(() => UserOTPEntity, (userOtp) => userOtp.user)
  userOtp: UserOTPEntity;

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  profile: ProfileEntity;

  @OneToOne(() => DiscourseEntity, (discourse) => discourse.user)
  discourse: DiscourseEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
  invitedBy: UserEntity | string;

  dtoClass = UserDto;
}
