import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection, ILike, QueryRunner } from 'typeorm';

import * as message from '../../shared/http/message.http';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '../../shared/config/config.service';
import { ReputationService } from '../reputation/reputation.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { PageDto } from '../../helpers/dto/PageDto';
import { PageMetaDto } from '../../helpers/dto/PageMetaDto';
import { UserDto } from '../user/dto/UserDto';
import { AddSkillDto } from './dto/payload/AddSkillDto';
import { AddUserSkillDto } from './dto/payload/AddUserSkillDto';
import { SkillDto } from './dto/SkillDto';
import { SkillMapDto } from './dto/SkillMapDto';
import { SkillEntity } from './entities/skill.entity';
import { SkillMapEntity } from './entities/skillMap.entity';
import { SkillRepository } from './repositories/skill.repository';
import { SkillMapRepository } from './repositories/skillMap.repository';
import { SkillUserMapRepository } from './repositories/skillUserMap.repository';
import { UserSkillDto } from './dto/response/UserSkillDto';
import { SkillInviteDto } from './dto/payload/SkillInviteDto';
import { SkillVerifyDto } from './dto/payload/SkillVerifyDto';
import { SkillVerificationRepository } from './repositories/skillVerification.repository';
import { SkillVerificationDto } from './dto/SkillVerificationDto';
import { ReputationConstantService } from '../reputationConstant/reputationConstant.service';
import { QuestionType } from '../reputationConstant/enums/questionType.enum';
import { VerificationQuestionListDto } from '../reputationConstant/dto/response/VerificationQuestionListDto';
import { VerifySkillDto } from './dto/payload/VerifySkillDto';
import { AnswerType } from '../reputationConstant/enums/answerType.enum';
import { AdminSettingsService } from '../adminSettings/adminSettings.service';
import { NotificationTypes } from '../notification/enums/notificationType.enum';

@Injectable()
export class SkillService {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly skillMapRepository: SkillMapRepository,
    private readonly skillUserMapRepository: SkillUserMapRepository,
    private readonly skillVerificationRepository: SkillVerificationRepository,
    private readonly userService: UserService,
    private readonly reputationConstantService: ReputationConstantService,
    private readonly reputationService: ReputationService,
    private readonly adminSettings: AdminSettingsService,
    private readonly notificationService: NotificationService,
    private logger: LoggerService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * @description Function to add unique skills in skill master table
   * @param skillsPayloadDto {name}
   * @param userId string( current logged in userId)
   * @returns { SkillEntity } data {name, createdBy}
   * @author Samsheer Alam
   */
  async addSkills(
    skillsPayloadDto: AddSkillDto,
    userId: string,
  ): Promise<SkillDto> {
    try {
      const skillPresent = await this.skillRepository
        .createQueryBuilder()
        .where('LOWER(name) = LOWER(:skill)', { skill: skillsPayloadDto.name })
        .getMany();

      if (skillPresent.length > 0) {
        throw new ConflictException(message.SkillAlreadyPresent);
      }
      const skills = {
        ...skillsPayloadDto,
        createdBy: userId,
      };
      const skill = this.skillRepository.create(skills);
      return this.skillRepository.save(skill);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches all or matching search skill whose status is true
   * @param filterDto query param data {page, limit}
   * @returns { SkillDto data } with pagination
   * @author Samsheer Alam
   */
  async getSkills(filterDto: FilterDto): Promise<PageDto<SkillDto>> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;
      const search = filterDto.search == undefined ? '' : filterDto.search;

      const totalRecord = await this.skillRepository.count({
        where: { status: true, name: ILike(`%${search}%`) },
      });

      const data = await this.skillRepository.find({
        where: { status: true, name: ILike(`%${search}%`) },
        skip: (page - 1) * limit,
        take: limit,
      });

      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: { page, limit },
        totalRecord,
      });
      return new PageDto(data, pageMetaDto);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to map team or project with skill.
   * Called from Project and Team service
   * @param removeOldSkill Represents if old skills for the team needs to be removed and new skill to be added.
   * @param where It is any beacuase it could have team or project info with keys accordingly
   * @param skillIds Array of skill Ids
   * @param queryRunner QueryRunner instance to insert record in skill with given transaction reference
   * @returns {SkillMapDto} skillId, userId
   * @author Samsheer Alam
   */
  async mapWithSkill(
    removeOldSkill: boolean,
    where: any,
    skillIds: string[],
    queryRunner: QueryRunner,
  ): Promise<SkillMapDto[]> {
    try {
      if (removeOldSkill) {
        await queryRunner.manager.delete(SkillMapEntity, where);
      }
      const dataToBeInserted = skillIds.map((skillId) => {
        return {
          ...where,
          skill: skillId,
          status: true,
        };
      });
      const createdSkills = this.skillMapRepository.create(dataToBeInserted);
      return await queryRunner.manager.save(createdSkills);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error.code === 25303) throw new BadRequestException('Invalid skill.');
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to fetch skill name for the given skill ids
   * called from team service
   * @param skillIds given skill ids
   * @returns Skill Name Array
   * @author Samsheer Alam
   */
  async getSkillsBySkillIds(skillIds: string[]): Promise<SkillDto[]> {
    try {
      return await this.skillRepository
        .createQueryBuilder('skill')
        .where('skill.id  IN (:...skillIds)', {
          skillIds: skillIds,
        })
        .select(['skill.name as name'])
        .execute();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to fetch the array of projectIds whose skill matches with the search value
   * This function is called from project service
   * @param skill string( search value)
   * @returns Array of projectIds
   * @author Samsheer Alam
   */
  async getMatchingSkillProjectIds(skill: string): Promise<string[]> {
    try {
      const projectIds =
        skill === undefined
          ? []
          : await this.skillMapRepository
              .createQueryBuilder('skill_map')
              .leftJoin(SkillEntity, 'skills', 'skills.id = skill_map.skill')
              .where('skill_map.project_id is not null')
              .andWhere('skill_map.status = :status', { status: true })
              .andWhere(`skills.name ILIKE  '%${skill}%'`)
              .distinctOn(['skill_map.project_id'])
              .select('skill_map.project_id')
              .execute();
      return projectIds.map(
        (item: { project_id: string }) => `'${item.project_id}'`,
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function is called from "addUserSkill", It checks if skill can be added for the user or else throws error
   * @param payloadDto {skills, domain, role}
   * @param user Logged in user info
   * @returns User profile info and skill info
   * @author Samsheer Alam
   */
  async checkIfSkillCanAdded(payloadDto: AddUserSkillDto, user: UserDto) {
    try {
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const getUserSkills = await this.skillUserMapRepository.find({
        where: {
          user: user,
          status: true,
        },
        relations: ['skill'],
      });
      if (
        getUserSkills.length >= maxAllowed.skills ||
        getUserSkills.length + payloadDto.skills.length > maxAllowed.skills
      ) {
        throw new BadRequestException(
          `Sorry, you cannot add more than ${maxAllowed.skills} skills.`,
        );
      }
      const skillIds = getUserSkills.map((item: any) => item.skill.id);

      const skillInfo = payloadDto.skills.map((item) => {
        skillIds.push(item.skillId);
        return {
          skill: item.skillId,
          user: user,
          level: item.level,
          experience: item.experience,
          status: true,
        };
      });
      const uniqueValues = new Set(skillIds);
      if (uniqueValues.size < skillIds.length) {
        throw new BadRequestException(message.DuplicateSkill);
      }
      const getUserProfile = await this.userService.getUserProfile(user);
      if (getUserProfile === undefined) {
        throw new BadRequestException(message.UserNotFound);
      }
      return { getUserProfile, skillInfo };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates domain and domainRoles in profile table and saves the skills in skillusermap table
   * @param payloadDto {skills, domain, role}
   * @param user Logged in user info
   * @returns Saved skills
   * @author Samsheer Alam
   */
  async addUserSkill(payloadDto: AddUserSkillDto, user: UserDto) {
    try {
      const { getUserProfile, skillInfo } = await this.checkIfSkillCanAdded(
        payloadDto,
        user,
      );
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        getUserProfile.domain = payloadDto.domain;
        getUserProfile.domainRole = payloadDto.role;

        await queryRunner.manager.save(getUserProfile);

        const skillInfoRef = this.skillUserMapRepository.create(skillInfo);
        await queryRunner.manager.save(skillInfoRef);

        await queryRunner.commitTransaction();
        this.reputationService.fetchVerifiersAndUpdateReputaion(user);
      } catch (err) {
        this.logger.error('Error while adding skills for the user', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of skill added by the user
   * @param user Logged in user info
   * @returns UserSkillDto
   * @author Samsheer Alam
   */
  async getUserSkills(user: UserDto): Promise<UserSkillDto[]> {
    try {
      const skills = await this.skillUserMapRepository.getSkillsForUser(
        user.id,
      );

      const result = skills.map((item: any) => {
        return {
          skillId: item?.skill?.id,
          skillName: item?.skill?.name === undefined ? '' : item?.skill?.name,
          level: item?.level === undefined ? '' : item?.level,
          experience: item?.experience === undefined ? '' : item?.experience,
          verificationStatus: item?.skillVerify.map((innerItem) => {
            return {
              name: innerItem?.name,
              email: innerItem?.email,
              isVerified: innerItem?.isVerified,
              profileImage:
                innerItem?.verifier?.profile?.profileImage === undefined
                  ? ''
                  : innerItem?.verifier?.profile?.profileImage,
            };
          }),
        };
      });
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Sends invitation email to members to verify the user skill
   * @param user Logged in user Info
   * @param sendInvitePayload SkillInviteDto data
   * @returns saved skillverification info
   * @author Samsheer Alam
   */
  async sendVerificationEmail(
    user: UserDto,
    sendInvitePayload: SkillInviteDto,
  ): Promise<SkillVerificationDto[]> {
    try {
      const { oldInvitations, skillMapInfo, skillInfo } =
        await this.getSkillInfoForInvitation(user, sendInvitePayload);

      const maxLimit = 5;
      const allEmails = oldInvitations.map((item) => item.email);

      const skillverifyInfo = await Promise.all(
        sendInvitePayload.members.map(async (item: SkillVerifyDto) => {
          const emailInfo = await this.userService.findOneUser({
            email: item.email,
          });
          if (emailInfo !== undefined && emailInfo.id === user.id) {
            throw new BadRequestException(message.InviteSelf);
          }
          allEmails.push(item.email);
          return {
            name: item.name,
            email: item.email,
            role: item.role,
            user,
            skillUserMap: skillMapInfo,
            skill: skillInfo,
            verifier: emailInfo === undefined ? null : emailInfo,
          };
        }),
      );
      const uniqueEmails = new Set(allEmails);
      if (uniqueEmails.size < oldInvitations.length + skillverifyInfo.length) {
        throw new BadRequestException(message.DuplicateSkillMember);
      }
      if (
        oldInvitations.length >= maxLimit ||
        oldInvitations.length + skillverifyInfo.length > maxLimit
      ) {
        throw new BadRequestException(message.InvitationLimit);
      }
      const createdSkillVerify =
        this.skillVerificationRepository.create(skillverifyInfo);
      const skillResult = await this.skillVerificationRepository.save(
        createdSkillVerify,
      );
      this.sendInvitationEmail(skillResult);
      this.reputationService.updateReputationScore(user);
      return skillResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description called from "sendVerificationEmail" function to get skill info
   * @param user Logged in user Info
   * @param sendInvitePayload SkillInviteDto data
   * @returns user skill info
   * @author Samsheer Alam
   */
  async getSkillInfoForInvitation(
    user: UserDto,
    sendInvitePayload: SkillInviteDto,
  ) {
    try {
      const skillInfo = await this.skillRepository.findOne({
        id: sendInvitePayload.skillId,
      });
      const skillMapInfo = await this.skillUserMapRepository.findOne({
        skill: skillInfo?.id,
        user,
      });
      if (skillInfo === undefined || skillMapInfo === undefined) {
        throw new BadRequestException(message.SkillNotFound);
      }
      const oldInvitations = await this.skillVerificationRepository.find({
        user,
        skill: skillInfo,
        status: true,
      });
      return { oldInvitations, skillMapInfo, skillInfo };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to send invitation to verify the skill of the user
   * @param inviteData {data which needs to be sent in email}
   * @author Samsheer Alam
   */
  async sendInvitationEmail(inviteData: SkillVerificationDto[]): Promise<void> {
    try {
      await Promise.all(
        inviteData.map(async (item) => {
          const { id } =
            await this.notificationService.sendInvitationNotification(
              item,
              NotificationTypes.SKILLS,
              'skill',
            );
          const verificationUrl = `${this.configService.get(
            'FE_BASE_URL',
          )}/verify?redirectUrl=${
            item?.verifier === undefined || item?.verifier === null
              ? 'signup'
              : 'login'
          }&invitedBy=${item?.user?.id}&email=${item.email}&id=${
            item?.id
          }&type=${QuestionType.SKILLS}&notificationId=${
            id === undefined ? '' : id
          }`;

          const emailData = {
            name: item.name,
            invitedByName: item?.user?.firstName,
            skillName: item?.skill?.name,
            level: item?.skillUserMap?.level,
            experience: item?.skillUserMap?.experience,
            invitedByEmail: item?.user?.email,
            invitedByPhoneNumber: item?.user?.profile?.phoneNumber,
            email: item.email,
            verificationUrl,
          };
          this.mailService.sendSkillVerificationInvite(emailData);
        }),
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To fetch the list of questions to be answered by the verifier to verify the skill
   * @param verifictaionId SkillId for which answers need to be verified
   * @returns List of questions to be anwered by the verifier
   * @author Samsheer Alam
   */
  async getSkillVerificationQuestion(
    verifictaionId: string,
    user: UserDto,
  ): Promise<VerificationQuestionListDto[]> {
    try {
      const skillVerify = await this.skillVerificationRepository.findOne({
        id: verifictaionId,
        verifier: user,
      });
      if (skillVerify === undefined) {
        throw new BadRequestException(message.InvalidVerifyId);
      }
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.SKILLS,
        );

      return questions.map((item: any) => {
        return {
          questionId: item?.id === undefined ? '' : item?.id,
          question: item?.question === undefined ? '' : item?.question,
          fieldName: item?.fieldName === undefined ? '' : item?.fieldName,
          createdAt: item?.createdAt === undefined ? '' : item?.createdAt,
          answerType:
            item?.answers === undefined
              ? ''
              : item?.answers.length <= 0
              ? ''
              : item?.answers[0]?.type,
          answers: item?.answers.map((answerItem) => {
            return {
              answerId: answerItem?.id,
              answer: answerItem?.answer,
            };
          }),
          subQuestions: [],
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Validates the answers for questions and updates the verification status
   * @param verifyPayload VerifyEmploymentDto (data which need to verify)
   * @param user Logged in user info
   * @returns verificationData
   * @author Samsheer Alam
   */
  async verifyQuestionsAnswer(
    user: UserDto,
    verifyPayload: VerifySkillDto,
  ): Promise<SkillVerificationDto> {
    try {
      const verificationInfo = await this.skillVerificationRepository.findOne({
        where: {
          id: verifyPayload.verificationId,
          verifier: user,
        },
        relations: ['skill', 'user', 'verifier'],
      });
      if (verificationInfo === undefined) {
        throw new BadRequestException(message.InvalidVerifyId);
      }
      if (verificationInfo.isVerified) {
        throw new BadRequestException(message.SkillAlreadyVerified);
      }
      const result = await this.getQuestionAndAnswerId(
        verifyPayload,
        verificationInfo,
        user,
      );
      await this.reputationConstantService.saveUsersAnswer(result);
      verificationInfo.isVerified = true;
      const verifiedInfo = await this.skillVerificationRepository.save(
        verificationInfo,
      );
      this.notificationService.sendVerifiedNotification(
        verificationInfo,
        NotificationTypes.SKILLS,
        'skill',
      );
      this.reputationService.updateReputationScore(verificationInfo?.user);
      return verifiedInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the answer id and question id which is mapped and saved in DB
   * Called from "verifyQuestionsAnswer" function
   * @param verifyPayload Payload data
   * @param verificationInfo Verification id info
   * @param user Logged in user info
   * @returns Data which needs to saved in DB
   * @author Samsheer Alam
   */
  async getQuestionAndAnswerId(
    verifyPayload: VerifySkillDto,
    verificationInfo: SkillVerificationDto,
    user: UserDto,
  ) {
    try {
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.SKILLS,
        );
      const result = [];
      questions.map((item: any) => {
        if (item?.fieldName !== undefined && item?.fieldName !== 'acurracy') {
          const answer =
            item?.answers.length > 1
              ? item?.answers.find(
                  (ans) => ans.id === verifyPayload[item.fieldName],
                )
              : item?.answers[0];

          result.push({
            invitedBy: verificationInfo?.user,
            verifiedBy: user,
            question: item,
            answer: answer,
            answerType: answer?.type,
            questionType: QuestionType.SKILLS,
            verificationId: verifyPayload?.verificationId,
            value:
              answer?.type === AnswerType.RATING
                ? verifyPayload[item.fieldName]
                : null,
            isNps: item.fieldName === 'recommendation' ? true : false,
          });
        }
      });
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
