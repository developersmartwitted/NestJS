import { EntityRepository, Repository } from 'typeorm';

import * as message from '../../../shared/http/message.http';
import { UserEntity } from '../entities/user.entity';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { ExportFilterDto } from '../../admin/dto/payload/ExportFilterDto';
import { Role } from '../../auth/enums/role.enum';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../../../shared/providers/logger.service';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description To fetch the list of all active users
   * @param filterDto {page, limit}
   * @returns List of active users based on page and limit. And total record count
   */
  async getUsersList(filterDto: FilterDto): Promise<{
    totalRecord: number;
    data: UserEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;
      const search =
        filterDto.search == undefined ? undefined : filterDto.search;
      const status = filterDto.status == undefined ? true : filterDto.status;

      let where = ` users.status = ${status} `;
      if (search !== undefined) {
        where += `AND (users.first_name ILIKE '%${search}%' OR users.last_name ILIKE  '%${search}%') `;
      }
      const promiseResult = await Promise.allSettled([
        /* Query to get total records count */
        this.createQueryBuilder('users')
          .where(where)
          .andWhere('users.roles @> :roles', { roles: [Role.USER] })
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('users')
          .where(where)
          .andWhere('users.roles @> :roles', { roles: [Role.USER] })
          .leftJoinAndSelect('users.profile', 'profile')
          .orderBy('users.createdAt', 'DESC')
          .skip((page - 1) * limit)
          .take(limit)
          .getMany(),
      ]);

      return {
        totalRecord:
          promiseResult[0].status === 'fulfilled' ? promiseResult[0].value : 0,
        data:
          promiseResult[1].status === 'fulfilled' ? promiseResult[1].value : [],

        pageOptionsDto: { page, limit },
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description called from admin service to fetch the list of user and export it
   * @param exportFilterDto {limit, page, userId}
   * @returns List of user
   */
  async getUsersToExport(
    exportFilterDto: ExportFilterDto,
  ): Promise<UserEntity[]> {
    try {
      const result = this.createQueryBuilder('user')
        .where('user.roles @> :roles', { roles: [Role.USER] })
        .leftJoinAndSelect('user.profile', 'profile')
        .orderBy('user.createdAt', 'DESC');

      if (exportFilterDto.status !== undefined) {
        result.andWhere('user.status = :status', {
          status: exportFilterDto.status,
        });
      }

      if (exportFilterDto.userId !== undefined) {
        result.andWhere('user.id = :userId', {
          userId: exportFilterDto.userId,
        });
      }
      if (
        exportFilterDto.page !== undefined &&
        exportFilterDto.limit !== undefined
      ) {
        result
          .skip((exportFilterDto.page - 1) * exportFilterDto.limit)
          .take(exportFilterDto.limit);
      }

      return result.getMany();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetch user info for given userId
   * @param userId Logged in user id
   * @returns UserEntity data
   */
  async getUserInfoById(userId: string): Promise<UserEntity[]> {
    try {
      return await this.createQueryBuilder('user')
        .where('user.id = :userId', { userId })
        .leftJoinAndSelect('user.profile', 'user_profile')
        .select([
          'user.id as "userId"',
          'user.firstName as "firstName"',
          'user.lastName as "lastName"',
          'user.email as "email"',
          'user_profile.profileImage as "profileImage"',
          'user_profile.hourlyRate as "hourlyRate"',
          'user_profile.about as about',
          'user_profile.externalLinks as "externalLinks"',
          'user_profile.address as "address"',
          'user_profile.state as "state"',
          'user_profile.country as "country"',
          'user_profile.phoneNumber as "phoneNumber"',
          'user_profile.personalWebsite as "personalWebsite"',
          'user_profile.reputationScore as "reputationScore"',
        ])
        .execute();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
