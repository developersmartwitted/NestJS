import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { AdminService } from '../admin.service';
import { AdminController } from '../admin.controller';
import { UserListDto } from '../dto/response/UserListDto';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { ExportFilterDto } from '../dto/payload/ExportFilterDto';
import { ActivateOrDeactivateDto } from '../dto/payload/ActivateOrDeactivateDto';
import { DashboardDto } from '../dto/response/DashboardDto';

jest.mock('../admin.service');

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [AdminController],
      providers: [AdminService],
    }).compile();

    controller = moduleRef.get<AdminController>(AdminController);
    adminService = moduleRef.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAdminProfileInfo', () => {
    describe('When getAdminProfileInfo is called', () => {
      let user: UserDto;
      let adminRes: HttpResponse;
      let userResult: UserListDto;
      beforeEach(async () => {
        adminRes = await controller.getAdminProfileInfo(user);
      });

      it('it should call getAdminProfile from adminService', () => {
        expect(adminService.getAdminProfile).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.ProfileInfo);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });

  describe('getUserList', () => {
    describe('When getUserList is called', () => {
      let filterDto: FilterDto;
      let adminRes: HttpResponse;
      let userResult: UserListDto;
      beforeEach(async () => {
        adminRes = await controller.getUserList(filterDto);
      });

      it('it should call getAllActiveUserList from adminService', () => {
        expect(adminService.getAllActiveUserList).toBeCalledWith(filterDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.UserList);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });

  describe('exportUserInfo', () => {
    describe('When exportUserInfo is called', () => {
      let exportFilterDto: ExportFilterDto;
      let adminRes: HttpResponse;
      let userResult: UserListDto;
      beforeEach(async () => {
        adminRes = await controller.exportUserInfo(exportFilterDto);
      });

      it('it should call exportUserInfo from adminService', () => {
        expect(adminService.exportUserInfo).toBeCalledWith(exportFilterDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.UserList);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });

  describe('getUserInfo', () => {
    describe('When getUserInfo is called', () => {
      let userId: string;
      let adminRes: HttpResponse;
      let userResult: UserListDto;
      beforeEach(async () => {
        adminRes = await controller.getUserInfo(userId);
      });

      it('it should call getUserDetail from adminService', () => {
        expect(adminService.getUserDetail).toBeCalledWith(userId);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.UserInfo);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });

  describe('activateOrDeactivateUser', () => {
    describe('When activateOrDeactivateUser is called', () => {
      let payload: ActivateOrDeactivateDto;
      let adminRes: HttpResponse;
      let userResult: UserDto;

      beforeEach(async () => {
        adminRes = await controller.activateOrDeactivateUser(payload);
      });

      it('it should call deactivateOrActivateUser from adminService', () => {
        expect(adminService.deactivateOrActivateUser).toBeCalledWith(payload);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.UserInfo);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });

  describe('getDashboardData', () => {
    describe('When getDashboardData is called', () => {
      let adminRes: HttpResponse;
      let userResult: DashboardDto;
      beforeEach(async () => {
        adminRes = await controller.getDashboardData();
      });

      it('it should call getDashboardInfo from adminService', () => {
        expect(adminService.getDashboardInfo).toBeCalledWith();
      });

      it('it should return', () => {
        const result = new HttpOkResponse(userResult, message.UserInfo);
        expect(adminRes).toStrictEqual(result);
      });
    });
  });
});
