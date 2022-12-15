import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection, QueryRunner } from 'typeorm';

import { AppGateway } from '../../helpers/gateway/app.gateway';
import * as message from '../../shared/http/message.http';
import { ConfigService } from '../../shared/config/config.service';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { AddProjectDto } from './dto/payload/AddProjectDto';
import { MyProjectListDto } from './dto/response/MyProjectListDto';
import { MyProjectDto } from './dto/payload/MyProjectDto';
import { ApplyProjectDto } from './dto/payload/ApplyProjectDto';
import { ProjectUserMapDto } from './dto/ProjectUserMapDto';
import { PageMetaDto } from '../../helpers/dto/PageMetaDto';
import { PageDto } from '../../helpers/dto/PageDto';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ProjectStatus } from './enums/projectStatus.enum';
import { ProjectType } from './enums/projectType.enum';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectFileRepository } from './repositories/projectFile.repository';
import { ProjectUserMapRepository } from './repositories/projectUserMap.repository';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { ProjectMemberDto } from './dto/response/ProjectMemberDto';
import { AcceptProjectDto } from './dto/payload/AcceptProjectDto';
import { UpdateProjectStatusDto } from './dto/payload/UpdateProjectStatusDto';
import { ProjectDto } from './dto/ProjectDto';
import { UpdateProjectDto } from './dto/payload/UpdateProjectDto';
import { ProjectFileEntity } from './entities/projectFile.entity';
import { SendProjectInviteDto } from './dto/payload/SendProjectInviteDto';
import { ProjectInviteRepository } from './repositories/projectInvite.repository';
import { MailService } from '../mail/mail.service';
import { ProjectInviteDto } from './dto/ProjectInviteDto';
import { RemoveProjectMemberDto } from './dto/payload/RemoveProjectMemberDto';
import { UserDto } from '../user/dto/UserDto';
import { InvitationType } from '../../shared/enums/invitationType.enums';
import { NotificationTypes } from '../notification/enums/notificationType.enum';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { AddProjectFileDto } from '../clientProject/dto/payload/AddProjectFileDto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProjectService {
  constructor(
    public readonly projectRepository: ProjectRepository,
    public readonly userService: UserService,
    public readonly skillService: SkillService,
    private readonly notificationService: NotificationService,
    public readonly projectFileRepository: ProjectFileRepository,
    public readonly projectUserMapRepository: ProjectUserMapRepository,
    public readonly projectInviteRepository: ProjectInviteRepository,
    private readonly mailService: MailService,
    private logger: LoggerService,
    public readonly notificationRepository: NotificationRepository,
    public appGateway: AppGateway,
    private configService: ConfigService,
  ) {}

  /**
   * @description Saves new project in project Table with created status. And maps the skills and saved in skill table.
   * @param projectPayloadDto {name, description, files, skills, budget, profileImage}
   * @param user Loged In user info
   * @returns ProjectEntity Data
   * @author Samsheer Alam
   */
  async createProject(
    projectPayloadDto: AddProjectDto,
    user: UserEntity,
  ): Promise<ProjectEntity> {
    try {
      let projectResult: ProjectEntity;

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        const projectInfo = {
          ...projectPayloadDto,
          user: user,
          isDeleted: false,
          status: ProjectStatus.CREATED,
        };
        const project = this.projectRepository.create(projectInfo);
        projectResult = await queryRunner.manager.save(project);
        await this.saveProjectFiles(
          projectResult,
          projectPayloadDto.files,
          queryRunner,
        );

        await this.skillService.mapWithSkill(
          false,
          { project: projectResult },
          projectPayloadDto.skills,
          queryRunner,
        );
        await this.saveProjectUserMap(user, projectResult, queryRunner);

        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while creating new project', { error: err });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Unable to create a project, Please try later.',
        );
      } finally {
        await queryRunner.release();
      }
      return projectResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "createProject" function to save files in project files
   * @param projectResult Newly created project info (ProjectEntity) data
   * @param files Files which needs to saved for the project
   * @param queryRunner QueryRunner instance to insert record in project files with given transaction reference
   * @author Samsheer Alam
   */
  async saveProjectFiles(
    projectResult: ProjectEntity,
    files: AddProjectFileDto[],
    queryRunner: QueryRunner,
  ) {
    try {
      const fileInfo = files.map((item) => {
        return {
          project: projectResult,
          file: item.fileLocation,
          fileName: item.fileName,
          fileMimeType: item.fileMimeType,
        };
      });
      const projectFiles = this.projectFileRepository.create(fileInfo);
      await queryRunner.manager.save(projectFiles);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Saves a user as OWNER in project user map
   * @param user Logged in user info
   * @param projectResult Newly created project info (ProjectEntity) data
   * @param queryRunner QueryRunner instance to insert record in project user map with given transaction reference
   * @author Samsheer Alam
   */
  async saveProjectUserMap(
    user: UserDto,
    projectResult: ProjectEntity,
    queryRunner: QueryRunner,
  ) {
    try {
      const recordToMap = {
        user: user.id,
        project: projectResult.id,
        createdByUser: user.id,
        status: true,
        type: ProjectType.OWNER,
      };
      const projectUserMap = this.projectUserMapRepository.create(recordToMap);
      await queryRunner.manager.save(projectUserMap);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Update the project Info. remove old files and skills data from DB and add given files and skills as new record.
   * @param updateProjectDto UpdateProjectDto data
   * @returns Updated projectInfo
   * @author Samsheer Alam
   */
  async updateProject(
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectEntity> {
    try {
      const projectInfo = await this.projectRepository.findOne({
        id: updateProjectDto.projectId,
      });
      if (projectInfo === undefined) {
        throw new BadRequestException('Project not found.');
      }
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        projectInfo.name = updateProjectDto.name;
        projectInfo.description = updateProjectDto.description;
        projectInfo.projectLogoName = updateProjectDto.projectLogoName;
        projectInfo.projectLogoLocation = updateProjectDto.projectLogoLocation;
        projectInfo.projectLogoMimeType = updateProjectDto.projectLogoMimeType;
        projectInfo.budget = updateProjectDto.budget;

        await queryRunner.manager.save(projectInfo);

        queryRunner.manager.delete(ProjectFileEntity, {
          project: projectInfo.id,
        });
        await this.saveProjectFiles(
          projectInfo,
          updateProjectDto.files,
          queryRunner,
        );

        await this.skillService.mapWithSkill(
          true,
          { project: projectInfo },
          updateProjectDto.skills,
          queryRunner,
        );

        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while updating project info: ', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Unable to update the project info, Please try later.',
        );
      } finally {
        await queryRunner.release();
      }
      return projectInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the data for explore project screen.
   * @param filterDto {page, limit, search}
   * @param user Logged in user info
   * @returns MyProjectListDto matching project list based on given search
   * @author Samsheer Alam
   */
  async getProjectList(
    filterDto: FilterDto,
    user: UserDto,
  ): Promise<PageDto<MyProjectListDto>> {
    try {
      const skillProjectIds =
        await this.skillService.getMatchingSkillProjectIds(filterDto.search);
      const queryResult =
        await this.projectRepository.getProjectsListForExplore(
          filterDto,
          skillProjectIds,
          user,
        );
      const result = queryResult.data.map((item: any) => {
        return {
          projectId: item?.id || '',
          projectName: item?.name || '',
          description: item?.description || '',
          skills: item?.skill.map((skillItem) => {
            return {
              skillId: skillItem?.skill?.id,
              skill: skillItem?.skill?.name,
            };
          }),
          budget: item?.budget || '',
          projectLogoName: item?.projectLogoName || '',
          projectLogoLocation: item?.projectLogoLocation || '',
          projectLogoMimeType: item?.projectLogoMimeType || '',
          applicantCount:
            item?.projectMap === undefined ? 0 : item?.projectMap.length,
        };
      });
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
   * @description Soft deletes the project for the given projectId
   * @param projectId string
   * @returns ProjectDto data
   * @author Samsheer Alam
   */
  async deleteProject(projectId: string): Promise<ProjectDto> {
    try {
      const projectInfo = await this.projectRepository.findOne({
        id: projectId,
      });
      if (projectInfo === undefined) {
        throw new BadRequestException('Project not found.');
      }
      projectInfo.isDeleted = true;
      return await this.projectRepository.save(projectInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the user map with the project
   * @param project RemoveProjectMemberDto { projectId, memberId}
   * @returns Updated project user map data
   * @author Samsheer Alam
   */
  async removeProjectMember(
    project: RemoveProjectMemberDto,
  ): Promise<ProjectUserMapDto> {
    try {
      const projectInfo = await this.projectRepository.findOne({
        id: project.projectId,
      });
      if (projectInfo === undefined) {
        throw new BadRequestException('Project not found.');
      }

      const userProjectMap = await this.projectUserMapRepository.findOne({
        user: project.memberId,
        project: project.projectId,
        status: true,
      });
      if (userProjectMap === undefined) {
        throw new BadRequestException('User is not a member of this project.');
      }
      if (userProjectMap.type === ProjectType.OWNER) {
        throw new BadRequestException('Sorry project owner cannot be removed.');
      }
      userProjectMap.status = false;
      return this.projectUserMapRepository.save(userProjectMap);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the data for my project screen for Created, ongoing, completed status of users project.
   * @param queryParam {page, limit, status, createdBy}
   * @param user Logged in user info
   * @returns MyProjectListDto data
   * @author Samsheer Alam
   */
  async getMyProjectData(
    queryParam: MyProjectDto,
    user: UserEntity,
  ): Promise<PageDto<MyProjectListDto>> {
    try {
      const queryResult = await this.projectRepository.getMyProjectData(
        queryParam,
        user,
      );
      const result = queryResult.data.map((item: any) => {
        return {
          projectId: item?.id || '',
          projectName: item?.name || '',
          description: item?.description || '',
          skills: item?.skill.map((skillItem) => {
            return {
              skillId: skillItem?.skill?.id,
              skill: skillItem?.skill?.name,
            };
          }),
          budget: item?.budget || '',
          projectLogoName: item?.projectLogoName || '',
          projectLogoLocation: item?.projectLogoLocation || '',
          projectLogoMimeType: item?.projectLogoMimeType || '',
          applicantCount:
            item?.projectMap === undefined ? 0 : item?.projectMap.length,
        };
      });

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
   * @description Fetches the data for my project screen. Else project is sent for status like applied
   * @param queryParam {page, limit, status, createdBy}
   * @param user Logged in user info
   * @returns MyProjectListDto data
   * @author Samsheer Alam
   */
  async getElseProjectData(
    queryParam: MyProjectDto,
    user: UserEntity,
  ): Promise<PageDto<MyProjectListDto>> {
    try {
      const queryResult = await this.projectRepository.getElseProjectData(
        queryParam,
        user,
      );
      const result = queryResult.data.map((item: any) => {
        const countRes = item?.projectMap.filter(
          (i) => i?.type === ProjectType.APPLIED,
        );
        return {
          projectId: item?.id || '',
          projectName: item?.name || '',
          description: item?.description || '',
          skills: item?.skill.map((skillItem) => {
            return {
              skillId: skillItem?.skill?.id,
              skill: skillItem?.skill?.name,
            };
          }),
          budget: item?.budget || '',

          projectLogoName: item?.projectLogoName || '',
          projectLogoLocation: item?.projectLogoLocation || '',
          projectLogoMimeType: item?.projectLogoMimeType || '',
          applicantCount: item?.projectMap === undefined ? 0 : countRes.length,
        };
      });
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
   * @description Apply to project which is listed under available project screen, and also user can invite other members while applying
   * @param user Logged in userentity info
   * @param applyProjectDto {projectId, message, inviteMembers(userId) array}
   * @returns {ProjectUserMapDto} (id, status, message, type)
   * @author Samsheer Alam
   */
  async applyForProject(
    user: UserEntity,
    applyProjectDto: ApplyProjectDto,
  ): Promise<ProjectUserMapDto> {
    try {
      const { projectId, message } = applyProjectDto;
      const checkIfAlreadyApplied = await this.projectUserMapRepository.find({
        where: {
          project: projectId,
          user: user.id,
          type: ProjectType.APPLIED,
        },
      });
      if (checkIfAlreadyApplied.length > 0) {
        throw new ConflictException('User already applied for this project');
      }
      const projectUserMapData = {
        user: user.id,
        project: projectId,
        createdByUser: user.id,
        status: true,
        message: message,
        type: ProjectType.APPLIED,
      };
      const projectUserMap =
        this.projectUserMapRepository.create(projectUserMapData);
      return await this.projectUserMapRepository.save(projectUserMap);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetch the project details along with user and list of files uploaded for the project
   * @param projectId string
   * @returns {Promise<ProjectEntity> }
   * @author Samsheer Alam
   */
  async getProjectInfoById(projectId: string): Promise<ProjectEntity> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId, isDeleted: false },
        relations: ['user', 'file', 'skill', 'skill.skill'],
      });
      if (project === undefined) {
        throw new BadRequestException('Project not found.');
      }
      const skills: any = project?.skill === undefined ? [] : project?.skill;
      project.skill = skills.map((skillItem) => {
        return {
          skillId: skillItem?.skill?.id,
          skill: skillItem?.skill?.name,
        };
      });
      return project;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Get all the members assigned with the project
   * @param projectId
   * @param filterDto query param data {page, limit}
   * @returns {ProjectMemberDto} data
   * @author Samsheer Alam
   */
  async getProjectMembersList(
    projectId: string,
    filterDto: FilterDto,
  ): Promise<PageDto<ProjectMemberDto>> {
    try {
      const queryResult =
        await this.projectUserMapRepository.getProjectMemberList(
          projectId,
          filterDto,
        );
      const result = queryResult.data.map((item: any) => {
        return {
          memberId: item?.user?.id || '',
          firstName: item?.user?.firstName || '',
          lastName: item?.user?.lastName || '',
          email: item?.user?.email || '',
          job: item?.user?.profile?.domain || '',
          profileImage: item?.user?.profile?.profileImage || '',
          about: item?.user?.profile?.about || '',
          type: item?.type || '',
        };
      });
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
   * @description Fetches the list of applicants  who has applied to the project
   * @param projectId string project Id
   * @param filterDto {page, limit}
   * @returns ProjectMemberDto data of list of members
   * @author Samsheer Alam
   */
  async getProjectApplicantList(
    projectId: string,
    filterDto: FilterDto,
  ): Promise<PageDto<ProjectMemberDto>> {
    try {
      const queryResult =
        await this.projectUserMapRepository.getProjectApplicantList(
          projectId,
          filterDto,
        );
      const result = queryResult.data.map((item: any) => {
        return {
          memberId: item?.user?.id || '',
          firstName: item?.user?.firstName || '',
          lastName: item?.user?.lastName || '',
          email: item?.user?.email || '',
          job: item?.user?.profile?.domain || '',
          about: item?.user?.profile?.about || '',
          profileImage: item?.user?.profile?.profileImage || '',
          type: item?.type || '',
        };
      });
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
   * @description Accepts project application
   * @param payload {projectId, memberId} AcceptProjectDto data
   * @param user Logged In user info
   * @returns ProjectUserMapDto data of list of members
   * @author Samsheer Alam
   */
  async acceptProjectApplication(
    payload: AcceptProjectDto,
    user: UserEntity,
  ): Promise<ProjectUserMapDto> {
    try {
      const projectInfo = await this.projectRepository.findOne({
        where: { id: payload.projectId },
        relations: ['user'],
      });

      const projectMapInfo = await this.projectUserMapRepository.findOne({
        project: payload.projectId,
        user: payload.memberId,
      });

      if (projectInfo === undefined || projectMapInfo === undefined) {
        throw new BadRequestException('Project not found');
      }
      if (projectInfo.user.id !== user.id) {
        throw new BadRequestException(
          'Unauthorized to accept the application for this project',
        );
      }
      if (projectMapInfo.type === ProjectType.ACCEPTED) {
        throw new BadRequestException('Project is already accepted');
      }

      projectMapInfo.type = ProjectType.ACCEPTED;
      return await this.projectUserMapRepository.save(projectMapInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Update the project status, like create, ongoing, completed
   * @param payload {projectId, memberId} AcceptProjectDto data
   * @param user Logged in user info
   * @returns ProjectDto data
   * @author Samsheer Alam
   */
  async updateProjectStatus(
    payload: UpdateProjectStatusDto,
    user: UserEntity,
  ): Promise<ProjectDto> {
    try {
      const projectInfo = await this.projectRepository.findOne({
        where: { id: payload.projectId },
        relations: ['user'],
      });

      if (projectInfo === undefined) {
        throw new BadRequestException('Project not found');
      }
      if (projectInfo.user.id !== user.id) {
        throw new BadRequestException(
          'Unauthorized to update the status of this project',
        );
      }
      projectInfo.status = payload.projectStatus;
      return await this.projectRepository.save(projectInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Sends Email to invited user and saves the record in DB.
   * @param projectInviteDto SendProjectInviteDto data
   * @param user Logged in user info
   * @returns Invited userinfo
   * @author Samsheer Alam
   */
  async sendProjectInvite(
    projectInviteDto: SendProjectInviteDto,
    user: UserEntity,
  ): Promise<ProjectInviteDto> {
    try {
      if (projectInviteDto?.email === user?.email) {
        throw new BadRequestException('Invitation can not be sent to self');
      }
      const projectInfo = await this.projectRepository.findOne({
        where: { id: projectInviteDto.projectId },
        relations: ['skill', 'skill.skill', 'user'],
      });

      if (projectInfo === undefined) {
        throw new BadRequestException('Project not found');
      }
      const alreadySent = await this.projectInviteRepository
        .createQueryBuilder('project_invite')
        .where('project_invite.project_id = :projectId', {
          projectId: projectInfo.id,
        })
        .andWhere('project_invite.email  = :email', {
          email: projectInviteDto.email,
        })
        .execute();

      if (alreadySent.length > 0) {
        throw new BadRequestException(
          `Already sent invitation to ${projectInviteDto.email}.`,
        );
      }
      return await this.saveAndSendInviteEmail(
        projectInviteDto,
        user,
        projectInfo,
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Saves the invite data in DB and sends the invite email
   * @param projectInviteDto SendProjectInviteDto data
   * @param user Logged in user info
   * @param projectInfo ProjectDto data
   * @returns Invited info
   * @author Samsheer Alam
   */
  async saveAndSendInviteEmail(
    projectInviteDto: SendProjectInviteDto,
    user: UserDto,
    projectInfo: ProjectDto,
  ): Promise<ProjectInviteDto> {
    try {
      const projectSkills: any = projectInfo.skill;
      const skills = projectSkills.map((i) => i?.skill?.name);
      const verifier = await this.userService.findOneUser({
        email: projectInviteDto.email,
      });
      const inviteData = {
        ...projectInviteDto,
        skills,
        invitedBy: user,
        project: projectInfo,
        verifier,
      };

      const createdInviteRef = this.projectInviteRepository.create(inviteData);
      const sentInvite = await this.projectInviteRepository.save(
        createdInviteRef,
      );
      const { id } = await this.notificationService.sendInvitation(
        sentInvite,
        NotificationTypes.PROJECT,
        'project',
      );
      const verificationUrl = `${this.configService.get(
        'FE_BASE_URL',
      )}/verify?redirectUrl=${
        sentInvite?.verifier === undefined || sentInvite?.verifier === null
          ? 'signup'
          : 'login'
      }&invitedBy=${sentInvite?.invitedBy?.id}&email=${sentInvite.email}&id=${
        sentInvite?.id
      }&type=${InvitationType.PROJECT}&notificationId=${
        id === undefined ? '' : id
      }`;
      const emailData = {
        name: projectInviteDto.name,
        comment: projectInviteDto.comment,
        projectName: projectInfo.name,
        projectImage: `${this.configService.get('S3_BASE_URL')}/${
          projectInfo.projectLogoLocation
        }`,
        description: projectInfo.description,
        requiredSkills: skills,
        invitedByName: user.firstName,
        invitedByEmail: user.email,
        invitedByPhoneNumber: user?.profile?.phoneNumber,
        email: projectInviteDto.email,
        verificationUrl,
      };

      this.mailService.sendProjectInvite(emailData);
      return sentInvite;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
  /**
   * @description Checks if invite id is valid and then accepts the project invite
   * @param payload {id: string} invite id
   * @param user Logged in user info
   * @returns Added TeamUserMapDto data
   * @author Samsheer Alam
   */
  async acceptProjectInvite(
    payload: { id: string },
    user: UserEntity,
  ): Promise<ProjectUserMapDto> {
    try {
      const inviteInfo = await this.projectInviteRepository.findOne({
        where: {
          id: payload.id,
        },
        relations: ['project', 'invitedBy', 'verifier'],
      });
      if (inviteInfo === undefined) {
        throw new BadRequestException('Invalid id.');
      }
      if (inviteInfo?.project?.id === undefined) {
        throw new BadRequestException('Project not found');
      }

      const projectMapInfo = await this.projectUserMapRepository.findOne({
        project: inviteInfo.project.id,
        user: user.id,
      });
      if (projectMapInfo !== undefined) {
        throw new BadRequestException('Project invite already accepted');
      }
      const projectUserMapData = {
        user: user.id,
        project: inviteInfo.project.id,
        createdByUser: user.id,
        status: true,
        message: inviteInfo.comment,
        type: ProjectType.ACCEPTED,
      };

      const projectUserMap =
        this.projectUserMapRepository.create(projectUserMapData);
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        await this.projectUserMapRepository.save(projectUserMap);
        inviteInfo.isVerified = true;
        await this.projectInviteRepository.save(inviteInfo);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while accepting project invite: ', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
      this.notificationService.acceptInvitation(
        inviteInfo,
        NotificationTypes.PROJECT,
        'project',
      );
      return projectUserMap;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
