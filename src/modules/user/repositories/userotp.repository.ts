import { EntityRepository, Repository } from 'typeorm';

import { UserOTPEntity } from '../entities/otp.entity';

@EntityRepository(UserOTPEntity)
export class UserOtpRepository extends Repository<UserOTPEntity> {}
