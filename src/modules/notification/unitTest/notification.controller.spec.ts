import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { NotificationsDto } from '../dto/NotificationsDto';
import { UpdateNotificationStatus } from '../dto/payload/UpdateNotificationStatus';
import { NotificationSettingDto } from '../dto/NotificationSettingDto';
import { UpdateNotificationSettings } from '../dto/payload/UpdateNotificationSettings';

jest.mock('../notification.service');

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    controller = moduleRef.get<NotificationController>(NotificationController);
    notificationService =
      moduleRef.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    describe('When getNotifications is called', () => {
      let notificaitonRes: NotificationsDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.getNotifications(user);
      });

      it('it should call getNotifications from notificationService', () => {
        expect(notificationService.getNotifications).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          notificaitonRes,
          message.NotificationList,
        );
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('updateNotificationAsViewed', () => {
    describe('When updateNotificationAsViewed is called', () => {
      let notificaitonRes: NotificationsDto;
      let notificationPayload: UpdateNotificationStatus;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.updateNotificationAsViewed(
          user,
          notificationPayload,
        );
      });

      it('it should call updateNotificationAsViewed from notificationService', () => {
        expect(notificationService.updateNotificationAsViewed).toBeCalledWith(
          user,
          notificationPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          notificaitonRes,
          message.NotificationList,
        );
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('addNotificationSettings', () => {
    describe('When addNotificationSettings is called', () => {
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.addNotificationSettings(user);
      });

      it('it should call createNotificationSettings from notificationService', () => {
        expect(notificationService.createNotificationSettings).toBeCalledWith(
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.AddNotifySetting);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('getNotificationSettings', () => {
    describe('When getNotificationSettings is called', () => {
      let user: UserDto;
      let reputationConstRes: HttpResponse;
      let notificaitonRes: NotificationSettingDto;

      beforeEach(async () => {
        reputationConstRes = await controller.getNotificationSettings(user);
      });

      it('it should call getNotificationSettings from notificationService', () => {
        expect(notificationService.getNotificationSettings).toBeCalledWith(
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          notificaitonRes,
          message.NotificationList,
        );
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('updateNotificationSettings', () => {
    describe('When updateNotificationSettings is called', () => {
      let reputationConstRes: HttpResponse;
      let updatePayload: UpdateNotificationSettings;

      beforeEach(async () => {
        reputationConstRes = await controller.updateNotificationSettings(
          updatePayload,
        );
      });

      it('it should call updateNotificationSettings from notificationService', () => {
        expect(notificationService.updateNotificationSettings).toBeCalledWith(
          updatePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.AddNotifySetting);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });
});
