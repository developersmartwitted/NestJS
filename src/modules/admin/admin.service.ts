import { Injectable, InternalServerErrorException } from '@nestjs/common';
import moment from 'moment';

import * as message from '../../shared/http/message.http';
import { LoggerService } from '../../shared/providers/logger.service';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { PageDto } from '../../helpers/dto/PageDto';
import { PageMetaDto } from '../../helpers/dto/PageMetaDto';
import { UserNotFoundException } from '../../shared/exceptions/user-not-found.exception';
import { Role } from '../auth/enums/role.enum';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';
import { UserDto } from '../user/dto/UserDto';
import { UserRepository } from '../user/repositories/user.repository';
import { UserService } from '../user/user.service';
import { ActivateOrDeactivateDto } from './dto/payload/ActivateOrDeactivateDto';
import { ExportFilterDto } from './dto/payload/ExportFilterDto';
import { UserListDto } from './dto/response/UserListDto';

@Injectable()
export class AdminService {
  constructor(
    public readonly userRepository: UserRepository,
    public readonly connectionInviteRepo: ConnectionInviteRepository,
    private userService: UserService,
    private logger: LoggerService,
  ) {}

  /**
   * @description To get the logged in admin profile detail
   * @param user Loged in user info
   * @returns Users profile detail
   */
  async getAdminProfile(user: UserDto): Promise<UserListDto> {
    return this.userService.getUserProfileInfo(user);
  }

  /**
   * @description Fetches the list of user based filters, to show on admin profile menu
   * @param filterDto query param data {page, limit}
   * @returns Active user lists, UserListDto data with pagination
   * @author Samsheer Alam
   */
  async getAllActiveUserList(
    filterDto: FilterDto,
  ): Promise<PageDto<UserListDto>> {
    try {
      const queryResult = await this.userRepository.getUsersList(filterDto);

      const result = await Promise.all(
        queryResult.data.map((item) => {
          return this.getUserListData(item);
        }),
      );

      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: queryResult.pageOptionsDto,
        totalRecord: queryResult.totalRecord,
      });
      return new PageDto(result, pageMetaDto);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Get userinfo for the given userId
   * @param userId UserId of the user for which information is sent
   * @returns UserListDto data (user info)
   */
  async getUserDetail(userId: string): Promise<UserListDto> {
    try {
      const userInfo = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });
      if (userInfo === undefined) {
        throw new UserNotFoundException();
      }
      return this.getUserListData(userInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Activates or suspends user based on statusToUpdate variable.
   * called from deactivateUser and activateUser function from admin controller
   * @param payload ActivateOrDeactivateDto User id for which status needs to be updated
   * and statusToUpdate False for suspend, true for activate
   * @returns User info
   */
  async deactivateOrActivateUser(
    payload: ActivateOrDeactivateDto,
  ): Promise<UserDto> {
    try {
      const userInfo = await this.userRepository.findOne({
        where: { id: payload.userId },
        relations: ['profile'],
      });
      if (userInfo === undefined) {
        throw new UserNotFoundException();
      }
      userInfo.status = payload.statusToUpdate;
      await this.userRepository.save(userInfo);
      return userInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
  /**
   * @description Arrange the response as UserListDto and return it
   * Called from getUserDetail and getAllActiveUserList function in admin service
   * @param item UserDto data
   * @returns UserListDto data
   * @author Samsheer Alam
   */
  async getUserListData(item: UserDto): Promise<UserListDto> {
    return {
      userId: item?.id || '',
      status: item?.status || false,
      firstName: item?.firstName || '',
      lastName: item?.lastName || '',
      email: item?.email || '',
      phoneNumber: item?.profile?.phoneNumber || '',
      about: item?.profile?.about || '',
      hourlyRate: item?.profile?.hourlyRate || 0,
      profileImage: item?.profile?.profileImage || '',
      address: item?.profile?.address || '',
      state: item?.profile?.state || '',
      country: item?.profile?.country || '',
      domain: item?.profile?.domain || '',
      domainRole: item?.profile?.domainRole || '',
      personalWebsite: item?.profile?.personalWebsite || '',
      externalLinks: item?.profile?.externalLinks || '',
      createdAt: item?.createdAt || '',
    };
  }

  /**
   * @description To export the active user list or specific user
   * @param exportFilterDto {ExportFilterDto} userId, page, limit
   * @returns user list in csv format
   * @author Samsheer Alam
   */
  async exportUserInfo(
    exportFilterDto: ExportFilterDto,
  ): Promise<UserListDto[]> {
    try {
      const queryResult = await this.userRepository.getUsersToExport(
        exportFilterDto,
      );

      return await Promise.all(
        queryResult.map((item) => {
          return this.getUserListData(item);
        }),
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the count of active, inactive and all users for dashboard screen
   * @returns count of all user, active user and inactive user
   */
  async getDashboardInfo() {
    try {
      const fromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');

      const totalUserCount = await this.userRepository
        .createQueryBuilder('user')
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .getCount();
      const thisMonthCount = await this.userRepository
        .createQueryBuilder('user')
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .andWhere('user.created_at >= :fromDate', { fromDate })
        .getCount();

      const totalActiveUserCount = await this.userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: true })
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .getCount();
      const thisMonthActiveCount = await this.userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: true })
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .andWhere('user.created_at >= :fromDate', { fromDate })
        .getCount();

      const totalInActiveUserCount = await this.userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: false })
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .getCount();
      const thisMonthInactiveCount = await this.userRepository
        .createQueryBuilder('user')
        .where('user.status = :status', { status: false })
        .andWhere('user.roles @> :roles', { roles: [Role.USER] })
        .andWhere('user.created_at >= :fromDate', { fromDate })
        .getCount();
      return {
        allUser: {
          total: totalUserCount,
          lastMonth: thisMonthCount,
        },
        activeUser: {
          total: totalActiveUserCount,
          lastMonth: thisMonthActiveCount,
        },
        inActiveUser: {
          total: totalInActiveUserCount,
          lastMonth: thisMonthInactiveCount,
        },
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
