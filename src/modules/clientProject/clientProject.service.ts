import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import * as message from '../../shared/http/message.http';
import { LoggerService } from '../../shared/providers/logger.service';
import { MailService } from '../mail/mail.service';
import { AdminSettingsService } from '../adminSettings/adminSettings.service';
import { ReputationService } from '../reputation/reputation.service';
import { ConfigService } from '../../shared/config/config.service';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { NotificationTypes } from '../notification/enums/notificationType.enum';
import { AnswerType } from '../reputationConstant/enums/answerType.enum';
import { QuestionType } from '../reputationConstant/enums/questionType.enum';
import { ProjectFileRepository } from '../project/repositories/projectFile.repository';
import { QuestionDto } from '../reputationConstant/dto/QuestionDto';
import { VerificationQuestionListDto } from '../reputationConstant/dto/response/VerificationQuestionListDto';
import { ReputationConstantService } from '../reputationConstant/reputationConstant.service';
import { ProjectFileEntity } from '../project/entities/projectFile.entity';
import { UserDto } from '../user/dto/UserDto';
import { ClientProjectDto } from './dto/ClientProjectDto';
import { ClientProjectVerifyDto } from './dto/ClientProjectVerifyDto';
import { AddClientProjectDto } from './dto/payload/AddClientProjectDto';
import { DeleteClientProjectDto } from './dto/payload/DeleteClientProjectDto';
import { SendClientProjectInviteDto } from './dto/payload/SendClientProjectInviteDto';
import { UpdateClientProjectDto } from './dto/payload/UpdateClientProjectDto';
import { VerifyClientProjectDto } from './dto/payload/VerifyClientProjectDto';
import { ClientProjectListDto } from './dto/response/ClientProjectListDto';
import { ClientProjectRepository } from './repositories/clientProject.repository';
import { ClientProjectVerifyRepository } from './repositories/clientProjectVerify.repository';
import { AddProjectFileDto } from './dto/payload/AddProjectFileDto';

@Injectable()
export class ClientProjectService {
  constructor(
    private readonly clientProjectRepository: ClientProjectRepository,
    private readonly projectFileRepository: ProjectFileRepository,
    private readonly clientProjectVerifyRepository: ClientProjectVerifyRepository,
    private readonly reputationConstantService: ReputationConstantService,
    private readonly reputationService: ReputationService,
    private readonly adminSettings: AdminSettingsService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private mailService: MailService,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  /**
   * @description Save new record in client project table and docs in project_file table
   * @param clientProjectPayload AddClientProjectDto data
   * @param user Logged in user info
   * @returns saved project detail
   * @author Samsheer Alam
   */
  async addClientProject(
    clientProjectPayload: AddClientProjectDto,
    user: UserDto,
  ): Promise<any> {
    try {
      await this.checkMaxAllowed(user);
      const projectInfo = { ...clientProjectPayload, user, isDeleted: false };

      const project = this.clientProjectRepository.create(projectInfo);
      let projectResult: ClientProjectDto;

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        projectResult = await queryRunner.manager.save(project);
        const projectFiles = await this.arrangeProjectFiles(
          clientProjectPayload.supportingDocs,
          projectResult,
        );
        await queryRunner.manager.save(projectFiles);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while creating new project', { error: err });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
      this.reputationService.updateReputationScore(user);
      return projectResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "addClientProject" function, checks if user is allowed to add clientProject or not
   * @param user Logged in user info
   * @author Samsheer Alam
   */
  async checkMaxAllowed(user: UserDto): Promise<void> {
    try {
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const clientProject = await this.clientProjectRepository.find({
        user,
        isDeleted: false,
      });

      if (clientProject.length >= maxAllowed.project) {
        throw new BadRequestException(
          `Sorry you can not add more than ${maxAllowed.project} project`,
        );
      }
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Creates a project file entity which is inserted in project file table using transactions
   * Called from "addClientProject" function
   * @param documents List of files which are uploaded
   * @param projectResult Newly created client project id
   * @returns Structure for client project file which needs to be inserted
   * @author Samsheer Alam
   */
  async arrangeProjectFiles(
    documents: AddProjectFileDto[],
    projectResult: ClientProjectDto,
  ): Promise<ProjectFileEntity[]> {
    try {
      const fileInfo = documents.map((item) => {
        return {
          clientProject: projectResult,
          file: item.fileLocation,
          fileName: item.fileName,
          fileMimeType: item.fileMimeType,
        };
      });
      return this.projectFileRepository.create(fileInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Update the client project Info. remove old files from DB and add given files as new record.
   * @param clientProjectPayload UpdateClientProjectDto data
   * @returns Updated projectInfo
   * @author Samsheer Alam
   */
  async updateEmploymentData(
    clientProjectPayload: UpdateClientProjectDto,
    user: UserDto,
  ): Promise<ClientProjectDto> {
    try {
      const projectInfo = await this.getClientProjectDataById(
        clientProjectPayload.clientProjectId,
        user,
      );
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();

      try {
        projectInfo.name = clientProjectPayload.name;
        projectInfo.description = clientProjectPayload.description;
        projectInfo.url = clientProjectPayload.url;
        projectInfo.logoName = clientProjectPayload.logoName;
        projectInfo.logoLocation = clientProjectPayload.logoLocation;
        projectInfo.logoMimeType = clientProjectPayload.logoMimeType;

        await queryRunner.manager.save(projectInfo);
        queryRunner.manager.delete(ProjectFileEntity, {
          clientProject: projectInfo.id,
        });

        const projectFiles = await this.arrangeProjectFiles(
          clientProjectPayload.supportingDocs,
          projectInfo,
        );
        await queryRunner.manager.save(projectFiles);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while updating project info: ', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
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
   * @description To fetch the list of all cleint projects record of the logged in user.
   * @param user Logged in user info
   * @returns all client projects record of the user
   * @author Samsheer Alam
   */
  async getAllClientProjctData(user: UserDto): Promise<ClientProjectListDto[]> {
    try {
      const clientProject =
        await this.clientProjectRepository.getClientProjectInfo(user.id);

      return clientProject.map((item: any) => {
        return {
          clientProjectId: item?.id,
          name: item?.name || '',
          url: item?.url || '',
          logoName: item?.logoName || '',
          logoLocation: item?.logoLocation || '',
          logoMimeType: item?.logoMimeType || '',
          description: item?.description || '',
          file: item?.file || '',
          verificationStatus: item?.clientProjectVerify.map((innerItem) => {
            return {
              name: innerItem?.name || '',
              email: innerItem?.email || '',
              isVerified: innerItem?.isVerified || false,
              profileImage: innerItem?.verifier?.profile?.profileImage || '',
            };
          }),
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches single record detail for the given clientProject id
   * Called from controller, "updateEmploymentData"  and "sendClientProjectInvite" function
   * @param clientProjectId client project record id whose all details need to be fetched
   * @param user Logged in user detail
   * @returns Detail record of the given clientProject id
   * @author Samsheer Alam
   */
  async getClientProjectDataById(
    clientProjectId: string,
    user: UserDto,
  ): Promise<ClientProjectDto> {
    try {
      const projectInfo = await this.clientProjectRepository.findOne({
        where: {
          user,
          id: clientProjectId,
          isDeleted: false,
        },
        relations: ['file'],
      });
      if (projectInfo === undefined) {
        throw new BadRequestException(message.ClientProjectNotFound);
      }
      return projectInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the record in DB for the given employmentId
   * @param user Logged in user detail
   * @param deletePayload DeleteClientProjectDto{ clientProjectId }
   * @author Samsheer Alam
   */
  async deleteClientProjectData(
    user: UserDto,
    deletePayload: DeleteClientProjectDto,
  ): Promise<void> {
    try {
      const projectInfo = await this.clientProjectRepository.findOne({
        id: deletePayload.clientProjectId,
        user,
      });
      if (projectInfo === undefined) {
        throw new BadRequestException(message.ClientProjectNotFound);
      }
      projectInfo.isDeleted = true;
      await this.clientProjectRepository.save(projectInfo);
      this.reputationService.updateReputationScore(user);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Save the invitation record and send email with invitation content to the given email id.
   * @param user LoggedIn user detail
   * @param invitePayload SendClientProjectInviteDto data
   * @author Samsheer Alam
   */
  async sendClientProjectInvite(
    user: UserDto,
    invitePayload: SendClientProjectInviteDto,
  ) {
    try {
      const projectInfo = await this.getClientProjectDataById(
        invitePayload.clientProjectId,
        user,
      );
      const emailInfo = await this.userService.findOneUser({
        email: invitePayload.email,
      });
      if (emailInfo !== undefined && emailInfo.id === user.id) {
        throw new BadRequestException(message.InviteSelf);
      }
      const inviteInfo = await this.clientProjectVerifyRepository.find({
        user,
        clientProject: projectInfo,
        isDeleted: false,
      });

      if (inviteInfo.length > 0) {
        throw new BadRequestException(message.NotMoreThanOneInvite);
      }
      const inviteData = {
        ...invitePayload,
        user,
        clientProject: projectInfo,
        verifier: emailInfo === undefined ? null : emailInfo,
      };
      const inviteRef = this.clientProjectVerifyRepository.create(inviteData);
      const inviteResult = await this.clientProjectVerifyRepository.save(
        inviteRef,
      );
      this.sendInvitation(invitePayload, user, projectInfo, inviteResult);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Sends invite email and notification to verify client projects to verifier email
   * Called from 'sendClientProjectInvite' function
   * @param invitePayload SendClientProjectInviteDto data
   * @param user Logged in user info
   * @param projectInfo Project info
   * @param inviteResult Saved invite info
   * @author Samsheer Alam
   */
  async sendInvitation(
    invitePayload: SendClientProjectInviteDto,
    user: UserDto,
    projectInfo: ClientProjectDto,
    inviteResult: ClientProjectVerifyDto,
  ): Promise<void> {
    try {
      const { id } = await this.notificationService.sendInvitationNotification(
        inviteResult,
        NotificationTypes.CLIENT_PROJECT,
        'clientProject',
      );
      const emailData = {
        name: invitePayload.name,
        projectName: projectInfo.name,
        projectCost: invitePayload.cost,
        url: projectInfo.url,
        comments: invitePayload.comments,
        invitedByEmail: user?.email,
        invitedByName: user?.firstName,
        invitedByPhoneNumber: user?.profile?.phoneNumber,
        email: invitePayload.email,
        projectImage: `${this.configService.get('S3_BASE_URL')}/${
          projectInfo.logoLocation
        }`,
        verificationUrl: `${this.configService.get('FE_BASE_URL')}/verify?id=${
          inviteResult.id
        }&type=${QuestionType.CLIENT_PROJECT}&notificationId=${id}`,
      };

      this.mailService.sendClientProjectVerificationInvite(emailData);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetch the list of question to be sent to verifier or needs to be verified by the verifier
   * @param verificationId verificationId id for which the questions needs to fetched
   * @param user Logged in user id
   * @returns Questions which is sent to verifier to verify
   * @author Samsheer Alam
   */
  async getProjectVerificationQuestion(
    verificationId: string,
    user: UserDto,
  ): Promise<VerificationQuestionListDto[]> {
    try {
      const { projectInfo, verificationInfo } =
        await this.getClientVerificationInfo(verificationId, user);
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.CLIENT_PROJECT,
        );
      const filteredQuestion = await this.getProjectFilteredQuestions(
        questions,
        projectInfo,
        verificationInfo,
      );
      return await this.getQuestionArranged(filteredQuestion, questions);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Arrange the questions, which needs to be sent to the verifier
   * Called from "getProjectVerificationQuestion" function
   * @param questions QuestionDto data
   * @param projectInfo Client project dto data
   * @param verificationInfo client project verification dto data
   * @returns Question list in formated result
   * @author Samsheer Alam
   */
  async getProjectFilteredQuestions(
    questions: QuestionDto[],
    projectInfo: ClientProjectDto,
    verificationInfo: ClientProjectVerifyDto,
  ) {
    try {
      return questions.map((item: any) => {
        if (item?.parentQuestion === null) {
          const result = {
            questionId: item?.id || '',
            question: item?.question || '',
            fieldName: item?.fieldName || '',
            createdAt: item?.createdAt || '',
            answerType: '',
            subQuestions: [],
            answers: undefined,
          };
          if (item?.fieldName === 'acurracy') {
            result.answerType = AnswerType.CUSTOM;
            result.subQuestions = [
              {
                lable: 'Name',
                value:
                  projectInfo?.user?.firstName +
                  ' ' +
                  projectInfo?.user?.lastName,
                fieldName: 'userName',
              },
              {
                lable: 'Project',
                value: projectInfo?.name,
                fieldName: 'projectName',
              },
              {
                lable: 'Cost',
                value: verificationInfo?.cost,
                fieldName: 'projectCost',
              },
            ];
          } else {
            result.answerType =
              item?.answers === undefined
                ? ''
                : item?.answers.length <= 0
                ? ''
                : item?.answers[0]?.type;
            result.answers = item?.answers.map((answerItem) => {
              return {
                answerId: answerItem?.id,
                answer: answerItem?.answer,
              };
            });
          }
          return result;
        }
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Arranged question with answers which is used in desgning the form on FE
   * Called from "getProjectVerificationQuestion" function
   * @param filteredQuestion Client Project questions with answer
   * @param questions All Questions
   * @returns Arranged questions with answers
   * @author Samsheer Alam
   */
  async getQuestionArranged(
    filteredQuestion,
    questions,
  ): Promise<VerificationQuestionListDto[]> {
    try {
      const arrangedQuestion = filteredQuestion.map((resItem: any) => {
        const subQuestions = questions.filter(
          (itm) => itm.parentQuestion === resItem?.questionId,
        );
        return {
          ...resItem,
          subQuestions:
            subQuestions.length > 0
              ? subQuestions.map((item: any) => {
                  return {
                    questionId: item?.id || '',
                    question: item?.question || '',
                    fieldName: item?.fieldName || '',
                    createdAt: item?.createdAt || '',
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
                  };
                })
              : resItem?.subQuestions,
        };
      });

      const result = arrangedQuestion.filter((i) => i.questionId !== undefined);
      return result.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks verification id and sends the project and verification info
   * Called from "getProjectVerificationQuestion" function
   * @param verificationId client project verify id
   * @param user Logged in user info
   * @returns Project and verification table data
   * @author Samsheer Alam
   */
  async getClientVerificationInfo(
    verificationId: string,
    user: UserDto,
  ): Promise<{
    projectInfo: ClientProjectDto;
    verificationInfo: ClientProjectVerifyDto;
  }> {
    try {
      const verificationInfo = await this.clientProjectVerifyRepository.findOne(
        {
          where: {
            id: verificationId,
            verifier: user,
            isDeleted: false,
          },
          relations: ['clientProject'],
        },
      );
      if (verificationInfo === undefined) {
        throw new BadRequestException(message.ClientProjectNotFound);
      }

      const projectInfo = await this.clientProjectRepository.findOne({
        where: {
          id: verificationInfo?.clientProject?.id,
          isDeleted: false,
        },
        relations: ['user'],
      });
      if (projectInfo === undefined) {
        throw new BadRequestException(message.ClientProjectNotFound);
      }
      return { projectInfo, verificationInfo };
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
  async verifyClientProjectInvite(
    user: UserDto,
    verifyPayload: VerifyClientProjectDto,
  ): Promise<ClientProjectVerifyDto> {
    try {
      const verificationInfo = await this.getVerificationInfo(
        user,
        verifyPayload,
      );
      if (
        !verifyPayload.userName ||
        !verifyPayload.projectName ||
        !verifyPayload.projectCost
      ) {
        this.notificationService.sendFailedNotification(
          verificationInfo,
          NotificationTypes.CLIENT_PROJECT,
          verificationInfo?.clientProject?.name,
        );
        return verificationInfo;
      }
      const result = await this.getQuestionAndAnswerId(
        verifyPayload,
        verificationInfo,
        user,
      );
      await this.reputationConstantService.saveUsersAnswer(result);
      verificationInfo.isVerified = true;
      const verificationResult = await this.clientProjectVerifyRepository.save(
        verificationInfo,
      );
      this.notificationService.sendVerifiedNotification(
        verificationInfo,
        NotificationTypes.CLIENT_PROJECT,
        'clientProject',
      );
      this.reputationService.updateReputationScore(verificationInfo?.user);
      return verificationResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if verification id is valid and sends the verification info
   * Called from "verifyClientProjectInvite" function
   * @param user Logged in user info
   * @param verifyPayload VerifyClientProjectDto payload data
   * @returns verification info
   * @author Samsheer Alam
   */
  async getVerificationInfo(
    user: UserDto,
    verifyPayload: VerifyClientProjectDto,
  ): Promise<ClientProjectVerifyDto> {
    try {
      const verificationInfo = await this.clientProjectVerifyRepository.findOne(
        {
          where: {
            id: verifyPayload.verificationId,
            verifier: user,
          },
          relations: ['clientProject', 'user', 'verifier'],
        },
      );
      if (verificationInfo === undefined) {
        throw new BadRequestException(message.InvalidVerifyId);
      }
      if (verificationInfo.isVerified) {
        throw new BadRequestException(message.InviteAlreadySent);
      }
      return verificationInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the answer id and question id which is mapped and saved in DB
   * Called from "verifyClientProjectInvite" function
   * @param verifyPayload Payload data
   * @param verificationInfo Verification id info
   * @param user Logged in user info
   * @returns Data which needs to saved in DB
   * @author Samsheer Alam
   */
  async getQuestionAndAnswerId(
    verifyPayload: VerifyClientProjectDto,
    verificationInfo: ClientProjectVerifyDto,
    user: UserDto,
  ) {
    try {
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.CLIENT_PROJECT,
        );

      const result = [];
      questions.map((item: any) => {
        if (item?.answers.length > 0) {
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
            verificationId: verifyPayload?.verificationId,
            questionType: QuestionType.CLIENT_PROJECT,
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
