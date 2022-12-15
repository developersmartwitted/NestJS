import { EntityRepository, Repository } from 'typeorm';

import { SkillUserMapEntity } from '../entities/skillUserMap.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../../../shared/providers/logger.service';
import * as message from '../../../shared/http/message.http';

@EntityRepository(SkillUserMapEntity)
export class SkillUserMapRepository extends Repository<SkillUserMapEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description To fetch the skills given by the user
   * @param userId Loggedin user
   * @returns User skills with verification info
   * @author Samsheer Alam
   */
  async getSkillsForUser(userId: string) {
    try {
      return await this.createQueryBuilder('skill_user_map')
        .where('skill_user_map.user_id = :userId', { userId })
        .andWhere('skill_user_map.status = :status', { status: true })
        .leftJoinAndSelect('skill_user_map.skill', 'skill')
        .leftJoinAndSelect('skill_user_map.skillVerify', 'skill_verification')
        .leftJoinAndSelect('skill_verification.verifier', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .getMany();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
