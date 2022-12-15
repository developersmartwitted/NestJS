import { EntityRepository, Repository } from 'typeorm';

import { EmploymentEntity } from '../entities/employment.entity';

@EntityRepository(EmploymentEntity)
export class EmploymentRepository extends Repository<EmploymentEntity> {
  /**
   * @description Fetches the users employment list
   * @param userId Logged in user id
   * @returns Employment data with the verifier details
   */
  async getEmploymentInfo(userId: string) {
    return this.createQueryBuilder('employment')
      .where('employment.user_id = :userId', { userId })
      .andWhere('employment.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect(
        'employment.employmentVerify',
        'employment_verification',
      )
      .leftJoinAndSelect('employment_verification.verifier', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany();
  }
}
