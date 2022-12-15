import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { FilterDto } from '../../../helpers/dto/FilterDto';
import { TeamDto } from '../dto/TeamDto';
import { TeamEntity } from '../entities/team.entity';
import { TeamType } from '../enums/teamType.enum';
import { LoggerService } from '../../../shared/providers/logger.service';
import * as message from '../../../shared/http/message.http';

@EntityRepository(TeamEntity)
export class TeamRepository extends Repository<TeamEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description Fetches the list of all team info linked with the user along with pagination info
   * @param filterDto Pagination data, page and limit
   * @param userId Logged in user id
   * @returns  team count, array of team data, and pagination data
   */
  async getTeamsCreatedByUser(
    userId: string,
    filterDto: FilterDto,
    acceptedTeamId: { team_id: string }[],
  ): Promise<{
    totalRecord: number;
    data: TeamEntity[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;
      const teamIds = acceptedTeamId.map((i) => `'${i.team_id}'`);
      let where = `team.user_id = '${userId}' AND team.status = true
      AND team_user_map.type IN ('${TeamType.OWNER}', '${TeamType.INVITED}', '${TeamType.APPLIED}', '${TeamType.ACCEPTED}' )
      AND team_user_map.status = true`;

      if (teamIds.length > 0) {
        where = `(team.user_id = '${userId}' OR team.id IN (${teamIds})) AND team.status = true
        AND team_user_map.type IN ('${TeamType.OWNER}', '${TeamType.INVITED}', '${TeamType.APPLIED}', '${TeamType.ACCEPTED}' )
        AND team_user_map.status = true`;
      }

      const promiseResult = await Promise.allSettled([
        /* Query to get total records count */
        this.createQueryBuilder('team')
          .where(where)
          .leftJoin('team.teamMap', 'team_user_map')
          .getCount(),

        /* Query to get total records with offset and limit */
        this.createQueryBuilder('team')
          .where(where)
          .leftJoinAndSelect('team.skills', 'skill_map')
          .leftJoinAndSelect('skill_map.skill', 'skill')
          .leftJoinAndSelect('team.teamMap', 'team_user_map')
          .leftJoinAndSelect('team_user_map.user', 'user')
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
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the team info for the given teamId
   * @param teamId Team Id
   * @returns TeamDto data
   */
  async teamDetailsForGivenId(teamId: string): Promise<TeamDto> {
    try {
      return await this.createQueryBuilder('team')
        .where('team.id = :teamId', { teamId })
        .andWhere('team.status = :status', { status: true })
        .andWhere('team_user_map.type  IN (:...types)', {
          types: [
            TeamType.OWNER,
            TeamType.INVITED,
            TeamType.APPLIED,
            TeamType.ACCEPTED,
          ],
        })
        .andWhere('team_user_map.status = :status', { status: true })
        .leftJoinAndSelect('team.skills', 'skill_map')
        .leftJoinAndSelect('skill_map.skill', 'skill')
        .leftJoinAndSelect('team.teamMap', 'team_user_map')
        .leftJoinAndSelect('team_user_map.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .getOne();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
