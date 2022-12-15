import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { NotificationService } from '../notification/notification.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../../shared/config/config.service';

import { AddTeamDto } from './dto/payload/AddTeamDto';
import { TeamDto } from './dto/TeamDto';
import { TeamType } from './enums/teamType.enum';
import { TeamRepository } from './repositories/team.repository';
import { TeamUserMapRepository } from './repositories/teamUserMap.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { PageDto } from '../../helpers/dto/PageDto';
import { TeamListDto } from './dto/response/TeamListDto';
import { PageMetaDto } from '../../helpers/dto/PageMetaDto';
import { UpdateTeamDto } from './dto/payload/UpdateTeamDto';
import { UserEntity } from '../user/entities/user.entity';
import { DeleteTeamMemberDto } from './dto/payload/DeleteTeamMemberDto';
import { TeamUserMapDto } from './dto/TeamUserMapDto';
import { TeamInviteRepository } from './repositories/teamInvite.repository';
import { TeamEntity } from './entities/team.entity';
import { AddTeamInviteDto } from './dto/payload/AddTeamInviteDto';
import { SendTeamInviteDto } from './dto/payload/SendTeamInviteDto';
import { TeamInviteDto } from './dto/TeamInviteDto';
import { InvitationType } from '../../shared/enums/invitationType.enums';
import { NotificationTypes } from '../notification/enums/notificationType.enum';
import { UserDto } from '../user/dto/UserDto';
import * as message from '../../shared/http/message.http';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teamUserMapRepository: TeamUserMapRepository,
    private readonly teamInviteRepository: TeamInviteRepository,
    private readonly mailService: MailService,
    private readonly skillService: SkillService,
    private readonly notificationService: NotificationService,
    private userService: UserService,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  /**
   * Function to create a save new team and invited users to the added team
   * @param addTeamDto {AddTeam info}
   * @param user logged in user info
   * @returns { Promise<TeamDto> }
   * @author Samsheer Alam
   */
  async createNewTeam(
    addTeamDto: AddTeamDto,
    user: UserEntity,
  ): Promise<TeamDto> {
    try {
      let teamResult: TeamEntity;
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        const teamData = await this.getTeamData(addTeamDto, user);
        teamResult = await queryRunner.manager.save(teamData);

        const teamUserMap = await this.getTeamUserMapData(user, teamResult);
        await queryRunner.manager.save(teamUserMap);

        const inviteData = await this.getFormattedTeamInviteData(
          teamResult,
          user,
          addTeamDto.inviteMembers,
          addTeamDto.comment,
        );
        const createdTeamInvites = this.teamInviteRepository.create(inviteData);
        const inviteResult = await queryRunner.manager.save(createdTeamInvites);
        await this.skillService.mapWithSkill(
          false,
          { team: teamResult },
          addTeamDto.skills,
          queryRunner,
        );
        this.sendInviteEmail(addTeamDto.skills, teamResult, user, inviteResult);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while creating new team', { error: err });
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
      return teamResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Arranges the data in teamDto structure and creates a reference to be stored in DB and retured
   * Called from "createNewTeam" function
   * @param addTeamDto {AddTeam info}
   * @param user logged in user info
   * @returns TeamEntity data
   * @author Samsheer Alam
   */
  async getTeamData(
    addTeamDto: AddTeamDto,
    user: UserEntity,
  ): Promise<TeamEntity> {
    try {
      const teamInfo = {
        name: addTeamDto.name,
        description: addTeamDto.description,
        profileImageName: addTeamDto.profileImageName,
        profileImageLocation: addTeamDto.profileImageLocation,
        profileImageMimeType: addTeamDto.profileImageMimeType,
        user: user,
      };
      return this.teamRepository.create(teamInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Arranges the data in TeamUserMapDto structure and creates a reference to be stored in DB and retured
   * Called from "createNewTeam" function
   * @param teamResult {TeamDto info}
   * @param user logged in user info
   * @returns TeamUserMapDto data
   * @author Samsheer Alam
   */
  async getTeamUserMapData(
    user: UserDto,
    teamResult: TeamDto,
  ): Promise<TeamUserMapDto> {
    try {
      const teamUserMapData = {
        user: user,
        team: teamResult,
        createdByUser: user,
        status: true,
        type: TeamType.OWNER,
      };
      return this.teamUserMapRepository.create(teamUserMapData);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to get Team info, If team not present error is thrown
   * Called within Team service from "deleteTeam", "sendInvitationToUser" functions
   * @param teamId {Team Id}
   * @returns TeamInfo
   * @author Samsheer Alam
   */
  async getTeamInfo(teamId: string): Promise<TeamEntity> {
    try {
      const getTeamInfo = await this.teamRepository.findOne({
        where: {
          id: teamId,
        },
        relations: ['skills'],
      });
      if (getTeamInfo === undefined || getTeamInfo === null) {
        throw new BadRequestException('Team not found.');
      }
      return getTeamInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to generate array of data to be inserted in TeamInvite table
   * Checks if already sent invitation or user is registered with panoton and throws error
   * Called from createNewTeam and sendInvitationToUser function within this service
   * @param teamInfo Teaminfo data
   * @param userInfo Logged in user info
   * @param inviteData List of members to whom invite to be sent
   * @param comment Comment to be sent in email
   * @returns Array of AddTeamInviteDto data
   * @author Samsheer Alam
   */
  async getFormattedTeamInviteData(
    teamInfo: TeamEntity,
    userInfo: UserEntity,
    inviteData: AddTeamInviteDto[],
    comment: string,
  ): Promise<any> {
    try {
      const givenEmails = inviteData.map((item) => item.email);
      if (givenEmails.includes(userInfo.email)) {
        throw new BadRequestException('Invitation can not be sent to self');
      }
      const alreadySent = await this.teamInviteRepository
        .createQueryBuilder('team_invite')
        .where('team_invite.team_id = :teamId', { teamId: teamInfo.id })
        .andWhere('team_invite.email  IN (:...emails)', {
          emails: givenEmails,
        })
        .execute();

      if (alreadySent.length > 0) {
        const sentEmails = alreadySent.map((item) => item.team_invite_email);
        throw new BadRequestException(
          `Already sent invitation to [ ${sentEmails.join(',')} ]`,
        );
      }
      const result = await Promise.all(
        inviteData.map(async (item) => {
          const verifier = await this.userService.findOneUser({
            email: item.email,
          });
          return {
            team: teamInfo,
            firstName: item.firstName,
            lastName: item.lastName,
            designation: item.designation,
            email: item.email,
            comment: comment,
            invitedBy: userInfo,
            verifier,
          };
        }),
      );
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Send team invitation to the extrnal users via email
   * @param invitePayload {SendTeamInviteDto} data
   * @param user Logged in users info
   * @returns Inserted TeamInvite data
   * @author Samsheer Alam
   */
  async sendInvitationToUser(
    invitePayload: SendTeamInviteDto,
    user: UserEntity,
  ): Promise<TeamInviteDto[]> {
    try {
      const teamInfo = await this.getTeamInfo(invitePayload.teamId);

      const skillObject: any = teamInfo.skills;
      const skills = skillObject.map((item) => item.id);
      const inviteData = await this.getFormattedTeamInviteData(
        teamInfo,
        user,
        invitePayload.inviteMembers,
        invitePayload.comment,
      );
      const createdTeamInvites = this.teamInviteRepository.create(inviteData);
      const inviteResult = await this.teamInviteRepository.save(
        createdTeamInvites,
      );
      this.sendInviteEmail(skills, teamInfo, user, inviteResult);
      return inviteResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Send Email invitation to the invited members
   * Called from createNewTeam and sendInvitationToUser function within this service
   * @param inviteResult List of users whom invite needs to be sent
   * @param skills Team Array of skills id
   * @param teamInfo Team info
   * @author Samsheer Alam
   */
  async sendInviteEmail(
    skills: string[],
    teamInfo: TeamEntity,
    userInfo: UserEntity,
    inviteResult: TeamInviteDto[],
  ) {
    try {
      const teamSkills = await this.skillService.getSkillsBySkillIds(skills);
      const skillList = teamSkills.map((item) => item.name);
      const skill = skillList.join(', ');
      await Promise.all(
        inviteResult.map(async (item) => {
          const { id } = await this.notificationService.sendInvitation(
            item,
            NotificationTypes.TEAM,
            'team',
          );
          const verificationUrl = `${this.configService.get(
            'FE_BASE_URL',
          )}/verify?redirectUrl=${
            item?.verifier === undefined || item?.verifier === null
              ? 'signup'
              : 'login'
          }&invitedBy=${item?.invitedBy?.id}&email=${item.email}&id=${
            item?.id
          }&type=${InvitationType.TEAM}&notificationId=${
            id === undefined ? '' : id
          }`;
          const emailData = {
            name: item.firstName,
            comment: item.comment,
            teamName: teamInfo.name,
            teamImage: `${this.configService.get('S3_BASE_URL')}/${
              teamInfo.profileImageLocation
            }`,
            description: teamInfo.description,
            requiredSkills: skill,
            invitedByName: userInfo.firstName,
            invitedByEmail: userInfo.email,
            invitedByPhoneNumber: userInfo?.profile?.phoneNumber,
            email: item.email,
            verificationUrl,
          };
          this.mailService.sendTeamInvite(emailData);
        }),
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to update a team basic info and skill
   * @param updateTeamDto {UpdateTeam DTO } data
   * @returns TeamDto
   * @author Samsheer Alam
   */
  async updateTeamInfo(updateTeamDto: UpdateTeamDto): Promise<TeamDto> {
    try {
      const teamInfo = await this.getTeamInfo(updateTeamDto.teamId);

      teamInfo.name = updateTeamDto.name;
      teamInfo.description = updateTeamDto.description;
      teamInfo.profileImageName = updateTeamDto.profileImageName;
      teamInfo.profileImageLocation = updateTeamDto.profileImageLocation;
      teamInfo.profileImageMimeType = updateTeamDto.profileImageMimeType;

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();

      let updatedTeam;
      try {
        updatedTeam = await queryRunner.manager.save(teamInfo);

        /** To remove old skill and inster the given skill in skill_map table */
        await this.skillService.mapWithSkill(
          true,
          { team: teamInfo },
          updateTeamDto.skills,
          queryRunner,
        );
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while creating new team', { error: err });
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
      return updatedTeam;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the team for the given teamId
   * @param teamId string
   * @returns TeamDto
   * @author Samsheer Alam
   */
  async deleteTeam(teamId: string): Promise<TeamDto> {
    try {
      const teamInfo = await this.getTeamInfo(teamId);
      teamInfo.status = false;
      return await this.teamRepository.save(teamInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the team member from team for the given user
   * @param team DeleteTeamMemberDto {teamId, teamMemberid} string
   * @returns TeamDto
   * @author Samsheer Alam
   */
  async deleteTeamMember(team: DeleteTeamMemberDto): Promise<TeamUserMapDto> {
    try {
      const teamInfo = await this.teamRepository.findOne({ id: team.teamId });
      const memberInfo = await this.userService.findOneUser({
        id: team.teamMemberId,
      });
      if (memberInfo === undefined) {
        throw new BadRequestException('Member not found.');
      }
      if (teamInfo === undefined) {
        throw new BadRequestException('Team not found');
      }
      const getTeamInfo = await this.teamUserMapRepository.findOne({
        team: teamInfo,
        user: memberInfo,
      });
      if (getTeamInfo === undefined) {
        throw new BadRequestException('User not found in team.');
      }
      if (getTeamInfo.type === TeamType.OWNER) {
        throw new BadRequestException(
          'You can not remove yourself from the team. since your the owner of the team.',
        );
      }
      getTeamInfo.status = false;
      return await this.teamUserMapRepository.save(getTeamInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * Calls getTeamsCreatedByUser function from teamRepository and
   * Fetcehs all the teams associated with logged in user.
   * @param userId string( current logged in userId)
   * @param filterDto query param data {page, limit}
   * @returns {TeamListDto(teamId, teamName, about, logo, banner, skills, job, type, totalMember)} along with Pagination info.
   * @author Samsheer Alam
   */
  async getTeamsCreatedByUser(
    userId: string,
    filterDto: FilterDto,
  ): Promise<PageDto<TeamListDto>> {
    try {
      const acceptedTeamId = await this.teamUserMapRepository
        .createQueryBuilder('team_user_map')
        .where('team_user_map.user_id = :userId', { userId })
        .andWhere('team_user_map.status = :status', { status: true })
        .andWhere('team_user_map.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('team_user_map.type = :accepted', {
          accepted: TeamType.ACCEPTED,
        })
        .distinctOn(['team_user_map.team_id'])
        .select('team_user_map.team_id')
        .execute();
      const queryResult = await this.teamRepository.getTeamsCreatedByUser(
        userId,
        filterDto,
        acceptedTeamId,
      );
      const result = await Promise.all(
        queryResult.data.map((item: any) => {
          return this.getArrangedTeamData(item, userId);
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
   * @description Fetches the teamInfo for the given teamId
   * @param userId Logged in user Id
   * @param teamId TeamId
   * @returns return team info,
   * @author Samsheer Alam
   */
  async getTeamsByTeamId(userId: string, teamId: string): Promise<TeamListDto> {
    try {
      const teamInfo = await this.teamRepository.teamDetailsForGivenId(teamId);
      if (teamInfo === undefined) {
        throw new BadRequestException('Team not found.');
      }
      return await this.getArrangedTeamData(teamInfo, userId);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "getTeamsCreatedByUser" and "getTeamsByTeamId" function to get data in TeamListDto structure
   * @param item TeamDto data
   * @returns TeamListDto data
   * @author Samsheer Alam
   */
  async getArrangedTeamData(
    item: TeamDto,
    userId: string,
  ): Promise<TeamListDto> {
    try {
      const skills: any = item?.skills;
      const teamMap: any = item?.teamMap;
      let type = '';
      const teamMembers = teamMap.map((teamMap) => {
        if (teamMap?.user?.id === userId) {
          type = teamMap?.type || '';
        }
        return {
          userId: teamMap?.user?.id || '',
          firstName: teamMap?.user?.firstName || '',
          lastName: teamMap?.user?.lastName || '',
          email: teamMap?.user?.email || '',
          profileImage: teamMap?.user?.profile?.profileImage || '',
          type: teamMap?.type || '',
        };
      });
      return {
        teamId: item?.id || '',
        teamName: item?.name || '',
        description: item?.description || '',
        profileImageName: item?.profileImageName || '',
        profileImageLocation: item?.profileImageLocation || '',
        profileImageMimeType: item?.profileImageMimeType || '',

        skills: skills.map((skillItem) => {
          return {
            skillId: skillItem?.skill?.id,
            skill: skillItem?.skill?.name,
          };
        }),
        type,
        teamMembers,
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if invite id is valid and then accepts the team invite
   * @param payload {id: string} invite id
   * @param user Logged in user info
   * @returns Added TeamUserMapDto data
   * @author Samsheer Alam
   */
  async acceptTeamInvite(
    payload: { id: string },
    user: UserEntity,
  ): Promise<TeamUserMapDto> {
    try {
      const inviteInfo = await this.teamInviteRepository.findOne({
        where: {
          id: payload.id,
        },
        relations: ['team', 'verifier', 'invitedBy'],
      });
      if (inviteInfo === undefined) {
        throw new BadRequestException('Invalid id.');
      }
      if (inviteInfo?.team?.id === undefined) {
        throw new BadRequestException('Team not found');
      }

      const teamMapInfo = await this.teamUserMapRepository.findOne({
        team: inviteInfo.team,
        user: user,
      });
      if (teamMapInfo !== undefined) {
        throw new BadRequestException('Team invite already accepted');
      }
      const teamUserMapData = {
        user: user,
        team: inviteInfo.team,
        createdByUser: user,
        status: true,
        type: TeamType.ACCEPTED,
      };

      const teamUserMap = this.teamUserMapRepository.create(teamUserMapData);
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        await this.teamUserMapRepository.save(teamUserMap);
        inviteInfo.isVerified = true;
        await this.teamInviteRepository.save(inviteInfo);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while accepting team invite: ', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
      this.notificationService.acceptInvitation(
        inviteInfo,
        NotificationTypes.TEAM,
        'team',
      );
      return teamUserMap;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
