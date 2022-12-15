import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { ProjectUserMapEntity } from '../entities/projectUserMap.entity';
import { ProjectType } from '../enums/projectType.enum';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import * as message from '../../../shared/http/message.http';
import { LoggerService } from '../../../shared/providers/logger.service';

@EntityRepository(ProjectUserMapEntity)
export class ProjectUserMapRepository extends Repository<ProjectUserMapEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description Get list of members, who has created or accepted the project
   * @param projectId string
   * @returns project count, project array of data and pagination data
   * @author Samsheer Alam
   */
  async getProjectMemberList(
    projectId: string,
    filterDto: FilterDto,
  ): Promise<{
    totalRecord: number;
    data: ProjectUserMapEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;

      const promiseResult = await Promise.allSettled([
        /* Query to get total records */
        this.createQueryBuilder('project_user_map')
          .where('project_user_map.project_id = :projectId', { projectId })
          .andWhere('project_user_map.status = :status', { status: true })
          .andWhere('project_user_map.type  IN (:...types)', {
            types: [ProjectType.OWNER, ProjectType.ACCEPTED],
          })
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('project_user_map')
          .where('project_user_map.project_id = :projectId', { projectId })
          .andWhere('project_user_map.status = :status', { status: true })
          .andWhere('project_user_map.type  IN (:...types)', {
            types: [ProjectType.OWNER, ProjectType.ACCEPTED],
          })
          .leftJoinAndSelect('project_user_map.user', 'user')
          .leftJoinAndSelect('user.profile', 'profile')
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
      this.logger.error(error);
      if (error.response.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Get list of members who has applied for the project
   * @param projectId string
   * @returns project count, project array of data and pagination data
   * @author Samsheer Alam
   */
  async getProjectApplicantList(
    projectId: string,
    filterDto: FilterDto,
  ): Promise<{
    totalRecord: number;
    data: ProjectUserMapEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;

      const promiseResult = await Promise.allSettled([
        /* Query to get total records */
        this.createQueryBuilder('project_user_map')
          .where('project_user_map.project_id = :projectId', { projectId })
          .andWhere('project_user_map.type  IN (:...types)', {
            types: [ProjectType.APPLIED],
          })
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('project_user_map')
          .where('project_user_map.project_id = :projectId', { projectId })
          .andWhere('project_user_map.type  IN (:...types)', {
            types: [ProjectType.APPLIED],
          })
          .leftJoinAndSelect('project_user_map.user', 'user')
          .leftJoinAndSelect('user.profile', 'profile')
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
      this.logger.error(error);
      if (error.response.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
