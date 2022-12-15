import { AbstractEntity } from '../../../helpers/entities/abstract.entity';
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

import { UserEntity } from './user.entity';
import { UserOtpDto } from '../dto/UserOtpDto';

@Entity({ name: 'user_otp' })
export class UserOTPEntity extends AbstractEntity<UserOtpDto> {
  @OneToOne(() => UserEntity, (user) => user.userOtp, { nullable: true })
  @JoinColumn()
  user: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  emailOtp: number;

  @Column({ nullable: false })
  emailOtpSendAt: Date;

  @Column({ nullable: false, default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  phoneOtp: number;

  @Column({ nullable: true })
  phoneOtpSendAt: Date;

  @Column({ nullable: false, default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  forgotPasswordOtp: number;

  @Column({ nullable: true })
  passwordOtpSendAt: Date;

  dtoClass = UserOtpDto;
}
