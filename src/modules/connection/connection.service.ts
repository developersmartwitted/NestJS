import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import moment from 'moment';

import { AppGateway } from '../../helpers/gateway/app.gateway';
import { NotificationService } from '../notification/notification.service';
import { InvitationType } from '../../shared/enums/invitationType.enums';
import { MailService } from '../mail/mail.service';
import { NotificationTypes } from '../notification/enums/notificationType.enum';
import { NotificationRepository } from '../notification/repositories/notification.repository';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ConnectionInviteDto } from './dto/ConnectionInviteDto';
import { RevokeConnectionDto } from './dto/payload/RevokeConnectionDto';
import { SendConnectionInviteDto } from './dto/payload/SendConnectionInviteDto';
import { ConnectionListDto } from './dto/response/ConnectionListDto';
import { ConnectionInviteRepository } from './repositories/connectionInvite.repository';
import * as message from '../../shared/http/message.http';
import { ConfigService } from '../../shared/config/config.service';
import { AdminSettingsService } from '../adminSettings/adminSettings.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionType } from './enums/connectionType.enum';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly connectionInviteRepo: ConnectionInviteRepository,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
    private userService: UserService,
    private readonly adminSettings: AdminSettingsService,
    private configService: ConfigService,
    private readonly notificationRepository: NotificationRepository,
    private appGateway: AppGateway,
    private logger: LoggerService,
  ) {}

  /**
   * @description Send Email invitation to external users for connection.
   * @param inviteConnection {SendConnectionInviteDto} daa
   * @param user UserEntity data
   * @returns ConnectionInviteDto data after saving the invite in DB
   * @author Samsheer Alam
   */
  async sendConnectionInvite(
    inviteConnection: SendConnectionInviteDto,
    user: UserEntity,
  ): Promise<ConnectionInviteDto> {
    try {
      const inviteInfo = await this.userService.findOneUser({
        email: inviteConnection.email,
      });
      await this.checkIfInvitationCanBeSent(inviteConnection, user);
      const invitePayload = {
        ...inviteConnection,
        invitedBy: user,
        user: inviteInfo === undefined ? null : inviteInfo,
        type: ConnectionType.INVITED,
      };
      const inviteData = this.connectionInviteRepo.create(invitePayload);
      const invitated = await this.connectionInviteRepo.save(inviteData);
      const { id } = await this.notificationService.sendConnectionInvitation(
        invitated,
        NotificationTypes.CONNECTION,
        'connections',
      );
      const verificationUrl = `${this.configService.get(
        'FE_BASE_URL',
      )}/verify?redirectUrl=${
        invitated?.user === undefined || invitated?.user === null
          ? 'signup'
          : 'login'
      }&invitedBy=${invitated?.invitedBy?.id}&email=${invitated.email}&id=${
        invitated?.id
      }&type=${InvitationType.CONNECTION}&notificationId=${
        id === undefined ? '' : id
      }`;
      const emailData = {
        name: invitated.firstName,
        comment: invitated.comment,
        invitedByName: user.firstName,
        invitedByEmail: user.email,
        invitedByPhoneNumber: user?.profile?.phoneNumber,
        email: invitated.email,
        verificationUrl,
      };
      this.mailService.sendConnectionInvite(emailData);
      return invitated;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if given is not registered, and connections sent is less that the max allowed
   * @param inviteConnection invitation payload from FE
   * @param user Logged in user info
   * @author Samsheer Alam
   */
  async checkIfInvitationCanBeSent(
    inviteConnection: SendConnectionInviteDto,
    user: UserEntity,
  ) {
    try {
      const ifInvitationAlreadySent = await this.connectionInviteRepo.findOne({
        invitedBy: user,
        email: inviteConnection.email,
        isDeleted: false,
      });
      if (ifInvitationAlreadySent !== undefined) {
        throw new BadRequestException(message.InviteAlreadySent);
      }
      const ifUserIsAlreadyConnceted = await this.connectionInviteRepo.findOne({
        user,
        email: inviteConnection.email,
        type: ConnectionType.ACCEPTED,
        isDeleted: false,
      });
      if (ifUserIsAlreadyConnceted !== undefined) {
        throw new BadRequestException(
          'User is already connected with this email.',
        );
      }
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const getTotalConnections = await this.connectionInviteRepo.count({
        invitedBy: user,
        isDeleted: false,
      });
      if (getTotalConnections >= maxAllowed.invites) {
        throw new BadRequestException(
          `Sorry, you can invite upto ${maxAllowed.invites} members only.`,
        );
      }
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
  /**
   * @description Checks if given id is valid and then accepts the connection invite
   * @param payload {id: string} invite id
   * @param user Logged in user info
   * @returns Updated connnection invite data
   * @author Samsheer Alam
   */
  async acceptConnectionInvite(
    payload: { id: string },
    user: UserEntity,
  ): Promise<ConnectionInviteDto> {
    try {
      const inviteInfo = await this.connectionInviteRepo.findOne({
        where: {
          id: payload.id,
          user,
        },
        relations: ['user', 'invitedBy'],
      });
      if (inviteInfo === undefined) {
        throw new BadRequestException(message.InvalidConnection);
      }
      inviteInfo.status = true;
      inviteInfo.type = ConnectionType.ACCEPTED;
      const result = await this.connectionInviteRepo.save(inviteInfo);
      const notificationPayload = {
        user: inviteInfo.invitedBy.id,
        typeId: inviteInfo?.id,
        notificationType: NotificationTypes.CONNECTION,
        title: `Connection invitation accepted`,
        message: `${inviteInfo?.user?.firstName} has accepted your connection invitation.`,
        createdAt: inviteInfo?.createdAt,
      };
      const notificationRef =
        this.notificationRepository.create(notificationPayload);
      const notificationResult = await this.notificationRepository.save(
        notificationRef,
      );
      this.appGateway.triggerEvent(
        `notify-${inviteInfo.invitedBy.id}`,
        notificationResult,
        inviteInfo.invitedBy.id,
      );
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To get the list of logged in users connection
   * @param userInfo Logged in user Entity data
   * @returns Array of ConnectionInviteDto data
   * @author Samsheer Alam
   */
  async getConnections(userInfo: UserDto): Promise<ConnectionListDto[]> {
    try {
      const connections = await this.connectionInviteRepo
        .createQueryBuilder('connection_invite')
        .where('connection_invite.invited_by_id = :userId', {
          userId: userInfo.id,
        })
        .andWhere('connection_invite.is_deleted = :isDeleted', {
          isDeleted: false,
        })
        .orWhere('connection_invite.user_id = :userId', {
          userId: userInfo.id,
        })
        .leftJoinAndSelect('connection_invite.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('connection_invite.invitedBy', 'invitedBy')
        .leftJoinAndSelect('invitedBy.profile', 'invitedByProfile')
        .getMany();

      return connections.map((item) => {
        const connectionType =
          userInfo?.id === item?.user?.id ? item?.invitedBy : item;
        const profile =
          userInfo?.id === item?.user?.id
            ? item?.invitedBy?.profile
            : item?.user?.profile;
        return {
          connectionId: item?.id,
          firstName: connectionType?.firstName || '',
          lastName: connectionType?.lastName || '',
          email: connectionType?.email || '',
          status: item?.status,
          type: item?.type,
          profileImage: profile?.profileImage || '',
          job: profile?.domain || '',
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function to soft delete the connection invite
   * @param userInfo Logged in user Entity data
   * @param payload Connection Id which needs to be removed
   * @author Samsheer Alam
   */
  async revokeConnection(userInfo: UserDto, payload: RevokeConnectionDto) {
    try {
      const connectionInfo = await this.connectionInviteRepo.findOne({
        where: { id: payload.connectionId },
        relations: ['invitedBy'],
      });
      if (connectionInfo === null || connectionInfo === undefined) {
        throw new NotFoundException(message.InvalidConnection);
      }
      if (connectionInfo?.invitedBy?.id !== userInfo.id) {
        throw new BadRequestException(message.InvalidConnection);
      }
      const createdAt = connectionInfo.createdAt;
      const diffInDays = moment().diff(moment(createdAt), 'days');

      if (connectionInfo.status || diffInDays > 30) {
        throw new BadRequestException(message.UnableToRevoke);
      }
      return this.connectionInviteRepo
        .createQueryBuilder()
        .update()
        .set({
          isDeleted: true,
          status: false,
        })
        .where('id = :id', { id: payload.connectionId })
        .execute();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
