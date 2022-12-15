import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { UserEntity } from '../../user/entities/user.entity';
import { MyProjectDto } from '../dto/payload/MyProjectDto';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectType } from '../enums/projectType.enum';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { UserDto } from '../../user/dto/UserDto';
import * as message from '../../../shared/http/message.http';
import { LoggerService } from '../../../shared/providers/logger.service';
import { ProjectStatus } from '../enums/projectStatus.enum';

@EntityRepository(ProjectEntity)
export class ProjectRepository extends Repository<ProjectEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description Fetch the data for myproject screen
   * @param queryParam {page, limit, status}
   * @param user Loggedin user info
   * @returns project count, project array of data, applied count data and pagination data
   * @author Samsheer Alam
   */
  async getMyProjectData(
    queryParam: MyProjectDto,
    user: UserEntity,
  ): Promise<{
    totalRecord: number;
    data: ProjectEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = queryParam.page == undefined ? 1 : queryParam.page;
      const limit = queryParam.limit == undefined ? 20 : queryParam.limit;
      const status = queryParam.status;
      const userId = user.id;

      /** Created, Listed, OnGoing, Completed */
      const promiseResult = await Promise.allSettled([
        /* Query to get total records count */
        this.createQueryBuilder('project')
          .where('project.user_id = :userId', { userId })
          .andWhere('project.status  = :type', { type: status })
          .andWhere('project.is_deleted  = :deleted', { deleted: false })
          .getCount(),
        /* Query to get total records with offset and limit */
        this.createQueryBuilder('project')
          .where('project.user_id = :userId', { userId })
          .andWhere('project.status  = :type', { type: status })
          .andWhere('project.is_deleted  = :deleted', { deleted: false })
          .leftJoinAndSelect('project.skill', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('project.file', 'file')
          .leftJoinAndSelect(
            'project.projectMap',
            'projectMap',
            'projectMap.type IN (:...types)',
            {
              types: [ProjectType.APPLIED],
            },
          )
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
   * @description Fetch the data for explores screen Except Createad and Completed project all are listed
   * @param filterDto {page, limit, search}
   * @param skillProjectIds Array of filtered projectId based on skill given in search
   * @param user Logged in user info
   * @returns project count, project array of data, and pagination data
   * @author Samsheer Alam
   */
  async getProjectsListForExplore(
    filterDto: FilterDto,
    skillProjectIds: string[],
    user: UserDto,
  ): Promise<{
    totalRecord: number;
    data: ProjectEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;
      const search =
        filterDto.search == undefined ? undefined : filterDto.search;

      let where = ` project.is_deleted = false and project.user_id != '${user.id}' 
      AND project.status !=  '${ProjectStatus.CREATED}' AND project.status != '${ProjectStatus.COMPLETED}' `;
      if (search !== undefined) {
        where += ' AND (';
        if (skillProjectIds.length > 0) {
          where += ` project.id IN (${skillProjectIds}) OR`;
        }
        where += ` project.name ILIKE '%${search}%' OR project.budget ILIKE  '%${search}%') `;
      }
      where += ` AND project.id not in  (
      Select distinct(project_id) from project_user_map 
      where project_user_map.user_id = '${user.id}'  
      )`;

      const promiseResult = await Promise.allSettled([
        /* Query to get total records count */
        this.createQueryBuilder('project')
          .leftJoinAndSelect('project.skill', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('project.file', 'file')
          .leftJoinAndSelect(
            'project.projectMap',
            'projectMap',
            'projectMap.type IN (:...types)',
            {
              types: [ProjectType.APPLIED],
            },
          )
          .where(where)
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('project')
          .where(where)
          .leftJoinAndSelect('project.skill', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('project.file', 'file')
          .leftJoinAndSelect(
            'project.projectMap',
            'projectMap',
            'projectMap.type IN (:...types)',
            {
              types: [ProjectType.APPLIED],
            },
          )
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

  async getElseProjectData(
    queryParam: MyProjectDto,
    user: UserEntity,
  ): Promise<{
    totalRecord: number;
    data: ProjectEntity[];
    pageOptionsDto: { page: number; limit: number };
    projectUserCount: { projectId: string; count: string }[];
  }> {
    try {
      const page = queryParam.page == undefined ? 1 : queryParam.page;
      const limit = queryParam.limit == undefined ? 20 : queryParam.limit;
      const status = queryParam.status;
      const userId = user.id;
      let where = `project.user_id != '${userId}' AND project.is_deleted = false `;
      if (status === ProjectType.APPLIED) {
        where += ` AND project.id IN  (
          Select distinct(project_id) from project_user_map 
          where project_user_map.user_id = '${userId}' AND project_user_map.type = '${ProjectType.APPLIED}'
         )`;
      } else {
        where += ` AND project.id IN  (
          Select distinct(project_id) from project_user_map 
          where project_user_map.user_id = '${userId}' AND project_user_map.type 
          IN ('${ProjectType.ACCEPTED}' )
          AND project.status = '${status}'
         )`;
      }

      const promiseResult = await Promise.allSettled([
        /* Query to get total records count */
        this.createQueryBuilder('project')
          .where(where)
          .leftJoinAndSelect('project.skill', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('project.file', 'file')
          .leftJoinAndSelect('project.projectMap', 'projectMap')
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('project')
          .where(where)
          .leftJoinAndSelect('project.skill', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('project.file', 'file')
          .leftJoinAndSelect('project.projectMap', 'projectMap')
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
        projectUserCount: [],
      };
    } catch (error) {
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
