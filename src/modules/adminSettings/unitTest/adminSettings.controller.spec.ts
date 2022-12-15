import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { AdminSettingsController } from '../adminSettings.controller';
import { AdminSettingsService } from '../adminSettings.service';
import { AddPlatformSettingsDto } from '../dto/payload/AddPlatformSettingsDto';
import { UserDto } from '../../user/dto/UserDto';
import { UpdatePlatformSettingsDto } from '../dto/payload/UpdatePlatformSettingsDto';
import { PlatformSettingsDto } from '../dto/PlatformSettingsDto';

jest.mock('../adminSettings.service');

describe('AdminSettingsController', () => {
  let controller: AdminSettingsController;
  let adminSettingsService: AdminSettingsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [AdminSettingsController],
      providers: [AdminSettingsService],
    }).compile();

    controller = moduleRef.get<AdminSettingsController>(
      AdminSettingsController,
    );
    adminSettingsService =
      moduleRef.get<AdminSettingsService>(AdminSettingsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewPlatform', () => {
    describe('When addNewPlatform is called', () => {
      let platformPayload: AddPlatformSettingsDto;
      let user: UserDto;
      let adminSettingRes: HttpResponse;

      beforeEach(async () => {
        adminSettingRes = await controller.addNewPlatform(
          user,
          platformPayload,
        );
      });

      it('it should call addNewPlatformToLimit from adminSettingsService', () => {
        expect(adminSettingsService.addNewPlatformToLimit).toBeCalledWith(
          platformPayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.AddedPlatformSetting,
        );
        expect(adminSettingRes).toStrictEqual(result);
      });
    });
  });

  describe('UpdatePlatform', () => {
    describe('When UpdatePlatform is called', () => {
      let platformPayload: UpdatePlatformSettingsDto;
      let adminSettingRes: HttpResponse;

      beforeEach(async () => {
        adminSettingRes = await controller.UpdatePlatform(platformPayload);
      });

      it('it should call updatePlatformSetting from adminSettingsService', () => {
        expect(adminSettingsService.updatePlatformSetting).toBeCalledWith(
          platformPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatePlatform);
        expect(adminSettingRes).toStrictEqual(result);
      });
    });
  });

  describe('getWeightageForReputation', () => {
    describe('When getWeightageForReputation is called', () => {
      let settingResponse: PlatformSettingsDto;
      let adminSettingRes: HttpResponse;

      beforeEach(async () => {
        adminSettingRes = await controller.getWeightageForReputation();
      });

      it('it should call fetchPlatformSettingRecord from adminSettingsService', () => {
        expect(
          adminSettingsService.fetchPlatformSettingRecord,
        ).toBeCalledWith();
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          settingResponse,
          message.PlatformSetting,
        );
        expect(adminSettingRes).toStrictEqual(result);
      });
    });
  });
});
