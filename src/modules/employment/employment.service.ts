import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import * as message from '../../shared/http/message.http';
import { ConfigService } from '../../shared/config/config.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { AdminSettingsService } from '../adminSettings/adminSettings.service';
import { MailService } from '../mail/mail.service';
import { NotificationTypes } from '../notification/enums/notificationType.enum';
import { NotificationService } from '../notification/notification.service';
import { ReputationService } from '../reputation/reputation.service';
import { QuestionDto } from '../reputationConstant/dto/QuestionDto';
import { VerificationQuestionListDto } from '../reputationConstant/dto/response/VerificationQuestionListDto';
import { AnswerType } from '../reputationConstant/enums/answerType.enum';
import { QuestionType } from '../reputationConstant/enums/questionType.enum';
import { ReputationConstantService } from '../reputationConstant/reputationConstant.service';
import { UserDto } from '../user/dto/UserDto';
import { UserService } from '../user/user.service';
import { EmploymentDto } from './dto/EmploymentDto';
import { EmploymentVerificationDto } from './dto/EmploymentVerificationDto';
import { AddEmploymentDto } from './dto/payload/AddEmploymentDto';
import { DeleteEmploymentDto } from './dto/payload/DeleteEmploymentDto';
import { SendEmploymentInvite } from './dto/payload/SendEmploymentInviteDto';
import { UpdateEmploymentDto } from './dto/payload/UpdateEmploymentDto';
import { VerifyEmploymentDto } from './dto/payload/VerifyEmploymentDto';
import { EmploymentListDto } from './dto/response/EmploymentListDto';
import { EmploymentRepository } from './repositories/employment.repository';
import { EmploymentVerificationRepository } from './repositories/employmentVerification.repository';

@Injectable()
export class EmploymentService {
  constructor(
    private readonly employmentRepository: EmploymentRepository,
    private readonly employmentVerfifyRepository: EmploymentVerificationRepository,
    private readonly reputationConstantService: ReputationConstantService,
    private readonly reputationService: ReputationService,
    private readonly adminSettings: AdminSettingsService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private mailService: MailService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  /**
   * @description To save a new employment record in DB in employment table.
   * @param employmentPayload AddEmploymentDto data
   * @param user Logged in user info
   * @returns created employment record
   * @author Samsheer Alam
   */
  async addEmployment(
    employmentPayload: AddEmploymentDto,
    user: UserDto,
  ): Promise<EmploymentDto> {
    try {
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const employmentList = await this.employmentRepository.find({
        user,
        isDeleted: false,
      });

      if (employmentList.length >= maxAllowed.employment) {
        throw new BadRequestException(
          `Sorry you can not add more than ${maxAllowed.employment} employment info.`,
        );
      }
      const employmentData = {
        ...employmentPayload,
        user,
      };
      this.reputationService.updateReputationScore(user);
      const createdEmployment =
        this.employmentRepository.create(employmentData);
      return await this.employmentRepository.save(createdEmployment);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the employment record for the given employment id
   * @param employmentPayload UpdateEmploymentDto data
   * @param user Logged in user info (UserDto) data
   * @returns Updated employment record
   * @author Samsheer Alam
   */
  async updateEmploymentData(
    employmentPayload: UpdateEmploymentDto,
    user: UserDto,
  ): Promise<EmploymentDto> {
    try {
      const employmentInfo = await this.employmentRepository.findOne({
        user,
        id: employmentPayload.employmentId,
        isDeleted: false,
      });
      if (employmentInfo === undefined) {
        throw new BadRequestException('Employment data not found.');
      }
      employmentInfo.role = employmentPayload.role;
      employmentInfo.organizationName = employmentPayload.organizationName;
      employmentInfo.companyLogoName = employmentPayload.companyLogoName;
      employmentInfo.companyLogoLocation =
        employmentPayload.companyLogoLocation;
      employmentInfo.description = employmentPayload.description;
      employmentInfo.fromMonth = employmentPayload.fromMonth;
      employmentInfo.fromYear = employmentPayload.fromYear;
      employmentInfo.toMonth = employmentPayload.toMonth;
      employmentInfo.toYear = employmentPayload.toYear;
      employmentInfo.currentlyWorking = employmentPayload.currentlyWorking;

      return await this.employmentRepository.save(employmentInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To fetch the list of all employment record of the logged in user.
   * @param user Logged in user info
   * @returns all employment record of the user
   * @author Samsheer Alam
   */
  async getAllEmploymentData(user: UserDto): Promise<EmploymentListDto[]> {
    try {
      const employment = await this.employmentRepository.getEmploymentInfo(
        user.id,
      );
      return employment.map((item: any) => {
        return {
          employmentId: item?.id,
          role: item?.role || '',
          organizationName: item?.organizationName || '',
          companyLogoName: item?.companyLogoName || '',
          companyLogoLocation: item?.companyLogoLocation || '',
          fromMonth: item?.fromMonth || '',
          fromYear: item?.fromYear || '',
          toMonth: item?.toMonth || '',
          toYear: item?.toYear || '',
          currentlyWorking: item?.currentlyWorking || '',
          description: item?.description || '',

          verificationStatus: item?.employmentVerify.map((innerItem) => {
            return {
              name: `${innerItem?.firstName || ''} ${
                innerItem?.lastName || ''
              }`,
              email: innerItem?.email || '',
              isVerified: innerItem?.isVerified,
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
   * @description Fetches single record detail for the given employment id
   * @param employmentId employment record id whose all details need to be fetched
   * @param user Logged in user detail
   * @returns Detail record of the given employment id
   * @author Samsheer Alam
   */
  async getEmploymentDataById(
    employmentId: string,
    user: UserDto,
  ): Promise<EmploymentDto> {
    try {
      const employmentInfo = await this.employmentRepository.findOne({
        where: {
          user,
          id: employmentId,
          isDeleted: false,
        },
        relations: ['user', 'user.profile'],
      });
      if (employmentInfo === undefined) {
        throw new BadRequestException('Employment data not found.');
      }
      return employmentInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the record in DB for the given employmentId
   * @param user Logged in user detail
   * @param deletePayload DeleteEmploymentDto{ employmentId }
   * @returns returns deleted record
   * @author Samsheer Alam
   */
  async deleteEmploymentData(
    user: UserDto,
    deletePayload: DeleteEmploymentDto,
  ) {
    try {
      const employmentInfo = await this.employmentRepository.findOne({
        id: deletePayload.employmentId,
        user,
      });
      if (employmentInfo === undefined) {
        throw new BadRequestException('Education information not found.');
      }
      employmentInfo.isDeleted = true;
      await this.employmentRepository.save(employmentInfo);
      return employmentInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Save the invitation record and send email with invitation content to the given email id.
   * @param user LoggedIn user detail
   * @param invitePayload SendEmploymentInvite data
   * @author Samsheer Alam
   */
  async sendEmploymentInvite(
    user: UserDto,
    invitePayload: SendEmploymentInvite,
  ): Promise<void> {
    try {
      const { employmentInfo, emailInfo } = await this.getEmploymentInviteInfo(
        user,
        invitePayload,
      );
      const inviteData = {
        ...invitePayload,
        user,
        employment: employmentInfo,
        verifier: emailInfo === undefined ? null : emailInfo,
      };
      const inviteRef = this.employmentVerfifyRepository.create(inviteData);
      const inviteResult = await this.employmentVerfifyRepository.save(
        inviteRef,
      );
      this.sendInvitation(invitePayload, employmentInfo, user, inviteResult);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if invitation is already sent or if invalid employment id and then fetches info from DB
   * Called from "sendEmploymentInvite" function
   * @param user Logged in user info
   * @param invitePayload Request body payload data
   * @returns Employment info and email user info
   * @author Samsheer Alam
   */
  async getEmploymentInviteInfo(
    user: UserDto,
    invitePayload: SendEmploymentInvite,
  ) {
    try {
      const employmentInfo = await this.employmentRepository.findOne({
        user,
        id: invitePayload.employmentId,
      });
      if (employmentInfo === undefined) {
        throw new BadRequestException(message.EmploymentNotFound);
      }

      const emailInfo = await this.userService.findOneUser({
        email: invitePayload.email,
      });
      if (emailInfo !== undefined && emailInfo.id === user.id) {
        throw new BadRequestException(message.InviteSelf);
      }

      const inviteInfo = await this.employmentVerfifyRepository.find({
        user,
        employment: employmentInfo,
        isDeleted: false,
      });
      if (inviteInfo.length > 0) {
        throw new BadRequestException(message.NotMoreThanOneInvite);
      }
      return { employmentInfo, emailInfo };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Sends employment verification invite to Email and notification if the verifier is registered with pannoton
   * Called from "sendEmploymentInvite" function
   * @param invitePayload request body payload
   * @param employmentInfo Employment data
   * @param user Logged in user info
   * @param inviteResult Saved invite info
   * @author Samsheer Alam
   */
  async sendInvitation(
    invitePayload: SendEmploymentInvite,
    employmentInfo: EmploymentDto,
    user: UserDto,
    inviteResult: EmploymentVerificationDto,
  ) {
    try {
      const { id } = await this.notificationService.sendInvitationNotification(
        inviteResult,
        NotificationTypes.EMPLOYMENT,
        'employment',
      );
      const verificationUrl = `${this.configService.get(
        'FE_BASE_URL',
      )}/verify?redirectUrl=${
        inviteResult?.verifier === undefined || inviteResult?.verifier === null
          ? 'signup'
          : 'login'
      }&invitedBy=${inviteResult?.user?.id}&email=${inviteResult.email}&id=${
        inviteResult?.id
      }&type=${QuestionType.EMPLOYMENT}&notificationId=${
        id === undefined ? '' : id
      }`;
      const emailData = {
        name: invitePayload.firstName,
        organizationName: employmentInfo.organizationName,
        companyLogo: `${this.configService.get('S3_BASE_URL')}/${
          employmentInfo.companyLogoLocation
        }`,
        role: employmentInfo.role,
        activeYears: `${employmentInfo.fromYear} - ${
          employmentInfo.toYear === null ? 'PRESENT' : employmentInfo.toYear
        }`,
        comments: invitePayload.comments,
        invitedByEmail: user?.email,
        invitedByName: user?.firstName,
        invitedByPhoneNumber: user?.profile?.phoneNumber,
        email: invitePayload.email,
        verificationUrl,
      };

      this.mailService.sendEmploymentVerificationInvite(emailData);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Arrange the questions, which needs to be sent to the verifier
   * @param questions QuestionDto data
   * @param empInfo EmploymentDto
   * @returns Question list in formated result
   * @author Samsheer Alam
   */
  async getEmpFilteredQuestions(
    questions: QuestionDto[],
    empInfo: EmploymentDto,
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
                value: empInfo?.user?.firstName + ' ' + empInfo?.user?.lastName,
                fieldName: 'userName',
              },
              {
                lable: 'Position',
                value:
                  empInfo?.user?.profile?.domain === undefined
                    ? ''
                    : empInfo?.user?.profile?.domain,
                fieldName: 'position',
              },
              {
                lable: 'Dates',
                value: `${empInfo.fromYear}-${empInfo.fromMonth} to ${empInfo.toYear}-${empInfo.toMonth}`,
                fieldName: 'employmentDate',
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
   * Called from "getEmploymmentVerificationQuestion" function
   * @param filteredQuestion Client Project questions with answer
   * @param questions All Questions
   * @returns Arranged questions with answers
   * @author Samsheer Alam
   */
  async getQuestionArranged(filteredQuestion, questions) {
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
              : resItem.subQuestions,
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
   * @description Fetch the list of question to be sent to verifier or needs to be verified by the verifier
   * @param verificationId verificationId id for which the questions needs to fetched
   * @param user Logged in user id
   * @returns Questions which is sent to verifier to verify
   * @author Samsheer Alam
   */
  async getEmploymmentVerificationQuestion(
    verificationId: string,
    user: UserDto,
  ): Promise<VerificationQuestionListDto[]> {
    try {
      const verificationInfo = await this.employmentVerfifyRepository.findOne({
        where: {
          id: verificationId,
          verifier: user,
          isDeleted: false,
        },
        relations: ['employment'],
      });

      if (verificationInfo === undefined) {
        throw new BadRequestException(message.EmploymentNotFound);
      }
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.EMPLOYMENT,
        );
      const empInfo = await this.employmentRepository.findOne({
        where: {
          id: verificationInfo?.employment?.id,
          isDeleted: false,
        },
        relations: ['user', 'user.profile'],
      });
      if (empInfo === undefined) {
        throw new BadRequestException(message.EmploymentNotFound);
      }
      const filteredQuestion = await this.getEmpFilteredQuestions(
        questions,
        empInfo,
      );
      return await this.getQuestionArranged(filteredQuestion, questions);
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
    verifyPayload: VerifyEmploymentDto,
    user: UserDto,
  ): Promise<EmploymentVerificationDto> {
    try {
      const verificationInfo = await this.getVerificationInfo(
        verifyPayload,
        user,
      );
      if (
        !verifyPayload.userName ||
        !verifyPayload.position ||
        !verifyPayload.employmentDates
      ) {
        this.notificationService.sendFailedNotification(
          verificationInfo,
          NotificationTypes.EMPLOYMENT,
          verificationInfo?.employment?.organizationName,
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
      const verificationResult = await this.employmentVerfifyRepository.save(
        verificationInfo,
      );
      this.notificationService.sendVerifiedNotification(
        verificationInfo,
        NotificationTypes.EMPLOYMENT,
        'employment',
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
   * @param verifyPayload VerifyEmploymentDto payload data
   * @returns verification info
   * @author Samsheer Alam
   */
  async getVerificationInfo(verifyPayload: VerifyEmploymentDto, user: UserDto) {
    try {
      const verificationInfo = await this.employmentVerfifyRepository.findOne({
        where: {
          id: verifyPayload.verificationId,
          verifier: user,
        },
        relations: ['employment', 'user', 'verifier'],
      });
      if (verificationInfo === undefined) {
        throw new BadRequestException(message.InvalidVerifyId);
      }
      if (verificationInfo.isVerified) {
        throw new BadRequestException(message.InvalidVerifyId);
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
   * Called from "verifyQuestionsAnswer" function
   * @param verifyPayload Payload data
   * @param verificationInfo Verification id info
   * @param user Logged in user info
   * @returns Data which needs to saved in DB
   * @author Samsheer Alam
   */
  async getQuestionAndAnswerId(
    verifyPayload: VerifyEmploymentDto,
    verificationInfo: EmploymentVerificationDto,
    user: UserDto,
  ) {
    try {
      const questions =
        await this.reputationConstantService.getQuestionsWithAnswer(
          QuestionType.EMPLOYMENT,
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
            questionType: QuestionType.EMPLOYMENT,
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
