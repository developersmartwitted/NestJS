import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AppGateway } from '../../helpers/gateway/app.gateway';
import { InvitationType } from '../../shared/enums/invitationType.enums';
import * as message from '../../shared/http/message.http';

import { VerifyDto } from '../auth/dto/payload/VerifyDto';
import { ClientProjectVerifyDto } from '../clientProject/dto/ClientProjectVerifyDto';
import { ClientProjectVerifyRepository } from '../clientProject/repositories/clientProjectVerify.repository';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';
import { EmploymentVerificationDto } from '../employment/dto/EmploymentVerificationDto';
import { EmploymentVerificationRepository } from '../employment/repositories/employmentVerification.repository';
import { ProjectInviteDto } from '../project/dto/ProjectInviteDto';
import { ProjectInviteRepository } from '../project/repositories/projectInvite.repository';
import { QuestionType } from '../reputationConstant/enums/questionType.enum';
import { SkillVerificationDto } from '../skill/dto/SkillVerificationDto';
import { SkillVerificationRepository } from '../skill/repositories/skillVerification.repository';
import { TeamInviteDto } from '../team/dto/TeamInviteDto';
import { TeamInviteRepository } from '../team/repositories/teamInvite.repository';
import { UserDto } from '../user/dto/UserDto';
import { NotificationsDto } from './dto/NotificationsDto';
import { NotificationSettingDto } from './dto/NotificationSettingDto';
import { UpdateNotificationSettings } from './dto/payload/UpdateNotificationSettings';
import { NotificationTypes } from './enums/notificationType.enum';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationSettingRepository } from './repositories/notificationSetting.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionInviteDto } from '../connection/dto/ConnectionInviteDto';
import { UpdateNotificationStatus } from './dto/payload/UpdateNotificationStatus';

@Injectable()
export class NotificationService {
  constructor(
    public readonly notificationSettingRepository: NotificationSettingRepository,
    public readonly notificationRepository: NotificationRepository,
    public readonly clientProjectverifyRepo: ClientProjectVerifyRepository,
    public readonly skillVerifyRepo: SkillVerificationRepository,
    public readonly employmentverifyRepo: EmploymentVerificationRepository,
    public readonly teamInviteRepository: TeamInviteRepository,
    public readonly projectInviteRepository: ProjectInviteRepository,
    public readonly connectionInviteRepository: ConnectionInviteRepository,
    private logger: LoggerService,
    private appGateway: AppGateway,
  ) {}

  /**
   * @description Fetches all the notifications user has.
   * @param user Logged in user info
   * @returns List of notification of the user
   * @author Samsheer Alam
   */
  async getNotifications(user: UserDto): Promise<NotificationsDto[]> {
    try {
      return await this.notificationRepository.find({
        where: { user: user.id, status: true },
        select: [
          'id',
          'notificationType',
          'typeId',
          'title',
          'message',
          'status',
          'isViewed',
          'createdAt',
        ],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the isViewed Key to true, to mark the notification as viewed
   * @param user Logged in user info
   * @param notificationPayload UpdateNotificationStatus dto data
   * @returns Updated Notification data
   * @author Samsheer Alam
   */
  async updateNotificationAsViewed(
    user: UserDto,
    notificationPayload: UpdateNotificationStatus,
  ): Promise<NotificationsDto> {
    try {
      const notificationInfo = await this.notificationRepository.findOne({
        where: { id: notificationPayload.notificationId, user: user.id },
      });
      if (notificationInfo === undefined) {
        throw new BadRequestException('Notification not found.');
      }
      notificationInfo.isViewed = notificationPayload.viewed;
      notificationInfo.status = notificationPayload.remove ? false : true;

      await this.notificationRepository.save(notificationInfo);
      return notificationInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
  /**
   * @description Creates a new settings record for notifications.
   * called from register function
   * @param userInfo Logged in user info
   * @returns created settings record
   * @author Samsheer Alam
   */
  async createNotificationSettings(
    userInfo: UserDto,
  ): Promise<NotificationSettingDto> {
    try {
      const notificationData = await this.notificationSettingRepository.findOne(
        {
          id: userInfo.id,
          isDeleted: false,
        },
      );
      if (notificationData !== undefined) {
        return;
      }
      const notifictaionSetting = {
        user: userInfo,
        isEmail: true,
        externalConnection: 3,
        internalConnection: 3,
      };
      const notificationRef =
        this.notificationSettingRepository.create(notifictaionSetting);
      return await this.notificationSettingRepository.save(notificationRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description to get notification setting record for logged in user
   * @param userInfo Logged in user info
   * @returns NotificationSettingDto data
   * @author Samsheer Alam
   */
  async getNotificationSettings(
    userInfo: UserDto,
  ): Promise<NotificationSettingDto> {
    try {
      return await this.notificationSettingRepository.findOne({
        user: userInfo,
        isDeleted: false,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the notificatins settings record
   * @param updatePayload UpdateNotificationSettings data
   * @returns updated notification record
   * @author Samsheer Alam
   */
  async updateNotificationSettings(
    updatePayload: UpdateNotificationSettings,
  ): Promise<NotificationSettingDto> {
    try {
      const notificationData = await this.notificationSettingRepository.findOne(
        {
          id: updatePayload.notificationSettingId,
          isDeleted: false,
        },
      );
      if (notificationData === undefined) {
        throw new BadRequestException(
          'Notification settings record not found.',
        );
      }
      notificationData.isEmail = updatePayload.isEmail;
      notificationData.externalConnection = updatePayload.externalConnection;
      notificationData.internalConnection = updatePayload.internalConnection;

      return await this.notificationSettingRepository.save(notificationData);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates verifier's id in verifications tables.
   * Called from auth service, after registering a new user
   * @param userInfo UserDto data
   * @author Samsheer Alam
   */
  async updateUserInfoInInvites(userInfo: UserDto): Promise<void> {
    try {
      await this.skillVerifyRepo.update(
        { email: userInfo.email },
        { verifier: userInfo },
      );
      await this.clientProjectverifyRepo.update(
        { email: userInfo.email },
        { verifier: userInfo },
      );
      await this.employmentverifyRepo.update(
        { email: userInfo.email },
        { verifier: userInfo },
      );
      await this.teamInviteRepository.update(
        { email: userInfo.email },
        { verifier: userInfo },
      );
      await this.projectInviteRepository.update(
        { email: userInfo.email },
        { verifier: userInfo },
      );
      await this.connectionInviteRepository.update(
        { email: userInfo.email },
        { user: userInfo },
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Fetches all the invites sent to the email address and save as notifications record.
   * Connection invites are accpeted by default not sent in notification
   * Called from auth service after registering a new user
   * @param userInfo Newly registered user info
   * @author Samsheer Alam
   */
  async saveInvitesAsNotifications(userInfo: UserDto): Promise<void> {
    try {
      const allVerificationDatas =
        await this.getAllInvitaionAndVerificationData(userInfo);
      const arrangedData = await Promise.all(
        allVerificationDatas.map(async (item: any) => {
          const userName = await this.getUserName(item);
          const { notificationType, title, type } =
            await this.getNotificationTypeAndTitle(item);

          let message = '';
          if (
            notificationType === NotificationTypes.SKILLS ||
            notificationType === NotificationTypes.CLIENT_PROJECT ||
            notificationType === NotificationTypes.EMPLOYMENT
          ) {
            message = `${userName} has invited you to verify his/her ${type}`;
          } else {
            message = `${userName} has invited you to join the ${type}`;
          }
          return {
            user: userInfo.id,
            typeId: item?.id,
            notificationType,
            title,
            message,
            createdAt: item?.createdAt,
          };
        }),
      );
      const notificationData = arrangedData.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      const notificationRef =
        this.notificationRepository.create(notificationData);
      await this.notificationRepository.save(notificationRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Fetches invitation or verification data from skill, clientProject, employment, project, team and connection.
   * This function called from saveInvitesAsNotifications
   * @param userInfo User info
   * @returns array of all verification table result
   * @author Samsheer Alam
   */
  async getAllInvitaionAndVerificationData(userInfo: UserDto) {
    try {
      const result = await Promise.all([
        this.skillVerifyRepo.find({
          where: { status: true, email: userInfo.email },
          relations: ['user', 'skill'],
        }),
        this.clientProjectverifyRepo.find({
          where: { isDeleted: false, email: userInfo.email },
          relations: ['user', 'clientProject'],
        }),
        this.employmentverifyRepo.find({
          where: { isDeleted: false, email: userInfo.email },
          relations: ['user', 'employment'],
        }),
        this.projectInviteRepository.find({
          where: { status: true, email: userInfo.email },
          relations: ['invitedBy', 'project', 'verifier'],
        }),
        this.teamInviteRepository.find({
          where: { status: true, email: userInfo.email },
          relations: ['invitedBy', 'team', 'verifier'],
        }),
        this.connectionInviteRepository.find({
          where: { isDeleted: false, email: userInfo.email },
          relations: ['user', 'invitedBy'],
        }),
      ]);
      return [
        ...result[0],
        ...result[1],
        ...result[2],
        ...result[3],
        ...result[4],
        ...result[5],
      ];
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Get firstName of user based on verification or invitation table result
   * This function called from saveInvitesAsNotifications inside arrangedData loop
   * @param item This is the individual verification table or invitable data
   * @returns firstName
   * @author Samsheer Alam
   */
  async getUserName(item: any): Promise<string> {
    return item?.invitedBy !== undefined
      ? item?.invitedBy?.firstName
      : item?.user?.firstName === undefined
      ? 'Some one'
      : item?.user?.firstName;
  }

  /**
   * @description Framed the notification title and notificationType
   * This function called from saveInvitesAsNotifications inside arrangedData loop
   * @param item This is the individual verification table or invitable data
   * @returns notificationType, type and notification title
   * @author Samsheer Alam
   */
  async getNotificationTypeAndTitle(item: any): Promise<any> {
    let notificationType = '';
    let type = '';
    let title = '';

    if (item?.skill !== undefined) {
      notificationType = NotificationTypes.SKILLS;
      type = 'skills';
      title = 'Invitation to verify skill';
    } else if (item?.clientProject !== undefined) {
      notificationType = NotificationTypes.CLIENT_PROJECT;
      type = 'project';
      title = 'Invitation to verify project';
    } else if (item?.employment !== undefined) {
      notificationType = NotificationTypes.EMPLOYMENT;
      type = 'employment info';
      title = 'Invitation to verify job experience';
    } else if (item?.project !== undefined) {
      notificationType = NotificationTypes.PROJECT;
      type = 'project';
      title = 'Invitation to join project';
    } else if (item?.team !== undefined) {
      notificationType = NotificationTypes.TEAM;
      type = 'team';
      title = 'Invitation to join team';
    } else {
      notificationType = NotificationTypes.CONNECTION;
      type = 'conenction';
      title = 'Invitation to join connection';
    }

    return { notificationType, title, type };
  }

  /**
   * @description Checks the given verification Id and checks if user is registered or not.
   * This is called from auth service.
   * @param verifyDto VerifyDto data
   * @returns isRegistered, type, verificationId, and isVerified
   * @author Samsheer Alam
   */
  async getVerficationResult(verifyDto: VerifyDto): Promise<{
    isRegistered: boolean;
    type: string;
    varificationId: string;
    invitedBy: string;
    isVerified: boolean;
    email: string;
  }> {
    try {
      const { verificationId, questionType } = verifyDto;
      let verificationRepo: string;
      let relation = ['verifier'];
      let type = 'verifier';
      let verificationStatusKey = 'isVerified';

      switch (questionType) {
        case QuestionType.SKILLS:
          verificationRepo = 'skillVerifyRepo';
          relation = ['user', 'verifier'];
          break;
        case QuestionType.EMPLOYMENT:
          verificationRepo = 'employmentverifyRepo';
          relation = ['user', 'verifier'];
          break;
        case QuestionType.CLIENT_PROJECT:
          verificationRepo = 'clientProjectverifyRepo';
          relation = ['user', 'verifier'];
          break;
        case InvitationType.TEAM:
          verificationRepo = 'teamInviteRepository';
          relation = ['invitedBy', 'verifier'];
          break;
        case InvitationType.PROJECT:
          verificationRepo = 'projectInviteRepository';
          relation = ['invitedBy', 'verifier'];
          break;
        case InvitationType.CONNECTION:
          verificationRepo = 'connectionInviteRepository';
          relation = ['user', 'invitedBy'];
          verificationStatusKey = 'status';
          type = 'user';
          break;
      }

      const verificationResult = await this[verificationRepo].findOne({
        where: {
          id: verificationId,
        },
        relations: relation,
      });
      if (verificationResult === undefined) {
        throw new BadRequestException(message.InvalidId);
      }
      const { invitedBy } = await this.getInvitedByUserId(
        questionType,
        verificationResult,
      );
      return {
        isRegistered:
          type === 'user'
            ? verificationResult?.user === undefined ||
              verificationResult?.user === null
              ? false
              : true
            : verificationResult?.verifier === undefined ||
              verificationResult?.verifier === null
            ? false
            : true,
        type: questionType,
        invitedBy,
        email: verificationResult?.email,
        varificationId: verificationResult?.id,
        isVerified: verificationResult?.[verificationStatusKey],
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called fro "getVerficationResult" function to get InvitedBy user id
   * @param questionType it can be one of InvitationType
   * @param verificationResult Verfication data
   * @returns {invitedBy: string}
   * @author Samsheer Alam
   */
  async getInvitedByUserId(questionType, verificationResult) {
    let invitedBy = '';
    if (
      questionType === InvitationType.CONNECTION ||
      questionType === InvitationType.PROJECT ||
      questionType === InvitationType.TEAM
    ) {
      invitedBy =
        verificationResult?.invitedBy?.id === undefined
          ? ''
          : verificationResult?.invitedBy?.id;
    } else {
      invitedBy =
        verificationResult?.user?.id === undefined
          ? ''
          : verificationResult?.user?.id;
    }
    return { invitedBy };
  }

  /**
   * @description Triggers notification for invitation of  Employment, client project or Skills
   * Called from "employmentService", "clientProjectService" and "skillService"
   * @param inviteResult Created invitation data
   * @param notificationType NotificationTypes (Employment, client project or Skills)
   * @param type Employment, client project or Skills
   *  @author Samsheer Alam
   */
  async sendInvitationNotification(
    inviteResult:
      | ClientProjectVerifyDto
      | EmploymentVerificationDto
      | SkillVerificationDto,
    notificationType: NotificationTypes,
    type: string,
  ): Promise<{ id: string }> {
    try {
      const userId = inviteResult.verifier?.id;
      if (userId !== undefined) {
        const notifyType = notificationType
          .toLocaleLowerCase()
          .replace('_', ' ');
        const notificationPayload = {
          user: userId,
          typeId: inviteResult?.id,
          notificationType,
          title: `Invitation to verify ${notifyType}`,
          message: `${
            inviteResult?.user?.firstName
          } has invited you to verify ${
            type === 'employment'
              ? inviteResult?.[type]?.organizationName
              : inviteResult?.[type]?.name
          } ${notifyType}.`,
          createdAt: inviteResult?.createdAt,
        };
        return await this.saveAndTriggerNotification(
          notificationPayload,
          userId,
        );
      }
      return { id: '' };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Triggers notification when Employment, client project or Skills is verified
   * Called from "employmentService", "clientProjectService" and "skillService"
   * @param verificationInfo Invitation data which is sent for verification
   * @param notificationType NotificationTypes (Employment, client project or Skills)
   * @param type Employment, client project or Skills
   * @author Samsheer Alam
   */
  async sendVerifiedNotification(
    verificationInfo:
      | ClientProjectVerifyDto
      | EmploymentVerificationDto
      | SkillVerificationDto,
    notificationType: NotificationTypes,
    type: string,
  ) {
    try {
      const userId = verificationInfo?.user?.id;
      if (userId !== undefined) {
        const notifyType = notificationType
          .toLocaleLowerCase()
          .replace('_', ' ');
        const notificationPayload = {
          user: userId,
          typeId: verificationInfo?.id,
          notificationType,
          title: `${
            type === 'employment'
              ? verificationInfo?.[type]?.organizationName
              : verificationInfo?.[type]?.name
          } ${notifyType} verified`,
          message: `${
            verificationInfo?.verifier?.firstName
          } has verified your ${
            type === 'employment'
              ? verificationInfo?.[type]?.organizationName
              : verificationInfo?.[type]?.name
          } ${notifyType}.`,
          createdAt: verificationInfo?.createdAt,
        };
        return await this.saveAndTriggerNotification(
          notificationPayload,
          userId,
        );
      }
      return { id: '' };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Triggers notification when Employment, client project or Skills verification is failed
   * Called from "employmentService", "clientProjectService" and "skillService"
   * @param verificationInfo Invitation data which is sent for verification
   * @param notificationType NotificationTypes (Employment, client project or Skills)
   * @param name Name of project, employment or skill which is failed
   * @author Samsheer Alam
   */
  async sendFailedNotification(
    verificationInfo: ClientProjectVerifyDto | EmploymentVerificationDto,
    notificationType: NotificationTypes,
    name: string,
  ) {
    try {
      const userId = verificationInfo?.user?.id;
      if (userId !== undefined) {
        const notifyType = notificationType
          .toLocaleLowerCase()
          .replace('_', '');
        const notificationPayload = {
          user: userId,
          typeId: verificationInfo?.id,
          notificationType,
          title: `${name} ${notifyType} verification failed`,
          message: `${verificationInfo?.verifier?.firstName} has reported that your
       ${name} ${notifyType} information is incorrect.`,
          createdAt: verificationInfo?.createdAt,
        };
        return await this.saveAndTriggerNotification(
          notificationPayload,
          userId,
        );
      }
      return { id: '' };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Saves notification data and triggers event for notificaiton to FE
   * @param notifyPayload Notification data which is to be saved
   * @param userId User id to whom the notification to be triggered
   * @author Samsheer Alam
   */
  async saveAndTriggerNotification(notifyPayload, userId) {
    try {
      const notificationRef = this.notificationRepository.create(notifyPayload);
      const notificationResult = await this.notificationRepository.save(
        notificationRef,
      );
      this.appGateway.triggerEvent(
        `notify-${userId}`,
        notificationResult,
        userId,
      );
      const notification: any = notificationResult;
      return { id: notification?.id === undefined ? '' : notification?.id };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Called from "project" and "team" to whenever user accept the invitation
   * @param inviteInfo This can be either TeamInviteDto or ProjectInviteDto data
   * @param notificationType Type of notification PROJECT or TEAM
   * @param type relation name from which the team or project info is fetched
   * @author Samsheer Alam
   */
  async acceptInvitation(
    inviteInfo: TeamInviteDto | ProjectInviteDto,
    notificationType: NotificationTypes,
    type: string,
  ) {
    try {
      const notificationPayload = {
        user: inviteInfo.invitedBy.id,
        typeId: inviteInfo?.id,
        notificationType,
        title: `${inviteInfo?.[type]?.name} invitation accepted`,
        message: `${inviteInfo?.verifier?.firstName} has accepted your ${inviteInfo?.[type]?.name} invitation.`,
        createdAt: inviteInfo?.createdAt,
      };
      return await this.saveAndTriggerNotification(
        notificationPayload,
        inviteInfo.invitedBy.id,
      );
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Sends notifications to invite user to the team or project
   * @param inviteInfo It can be either project or team invite data
   * @param notificationType TEAM or PROJECT
   * @param type Type of  notification team or project
   * @returns id (This is sent in email to redirect user to login or signup page based)
   * @author Samsheer Alam
   */
  async sendInvitation(
    inviteInfo: TeamInviteDto | ProjectInviteDto,
    notificationType: NotificationTypes,
    type: string,
  ) {
    try {
      if (inviteInfo?.verifier?.id !== undefined) {
        const notificationPayload = {
          user: inviteInfo?.verifier?.id,
          typeId: inviteInfo?.id,
          notificationType,
          title: `Invitation to join ${type}`,
          message: `${inviteInfo?.invitedBy?.firstName} has sent you the invitation to join ${inviteInfo?.[type]?.name} ${type}`,
          createdAt: inviteInfo?.createdAt,
        };
        return await this.saveAndTriggerNotification(
          notificationPayload,
          inviteInfo?.verifier?.id,
        );
      }
      return { id: '' };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }

  /**
   * @description Called to send invitation for both internal and external user for connections
   * @param inviteInfo ConnectionInviteDto data
   * @param notificationType CONNECTION
   * @param type Type of notification connection
   * @returns id (This is sent in email to redirect user to login or signup page based)
   * @author Samsheer Alam
   */
  async sendConnectionInvitation(
    inviteInfo: ConnectionInviteDto,
    notificationType: NotificationTypes,
    type: string,
  ) {
    try {
      if (inviteInfo?.user?.id !== undefined) {
        const notificationPayload = {
          user: inviteInfo?.user?.id,
          typeId: inviteInfo?.id,
          notificationType,
          title: `Invitation to join ${type}`,
          message: `${inviteInfo?.invitedBy?.firstName} has sent you the invitation to join ${inviteInfo?.firstName} ${type}`,
          createdAt: inviteInfo?.createdAt,
        };
        return await this.saveAndTriggerNotification(
          notificationPayload,
          inviteInfo?.user?.id,
        );
      }
      return { id: '' };
    } catch (error) {
      this.logger.error(error?.message, error);
    }
  }
}
