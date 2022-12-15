import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import { UploadS3Dto } from '../dto/payload/UploadS3Dto';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { S3Service } from '../../../shared/providers/s3.service';
import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../dto/UserDto';
import { UpdateProfileDto } from '../dto/payload/UpdatePofileDto';
import { ChangePasswordDto } from '../dto/payload/ChangePasswordDto';

jest.mock('../user.service');
jest.mock('../../../shared/providers/s3.service');

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [UserService, S3Service],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
    s3Service = moduleRef.get<S3Service>(S3Service);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getS3Url', () => {
    describe('When getS3Url is called', () => {
      let s3Url: HttpResponse;
      let uploadDto: UploadS3Dto;
      beforeEach(async () => {
        s3Url = await controller.getS3Url(uploadDto);
      });

      test('it should call generateUploadUrl from s3services', () => {
        expect(s3Service.generateUploadUrl).toBeCalledWith(uploadDto);
      });

      test('it should return', () => {
        const result = new HttpOkResponse(s3Url.data, message.S3Url);
        expect(s3Url).toStrictEqual(result);
      });
    });
  });

  describe('getUserInfo', () => {
    describe('When getUserInfo is called', () => {
      let userProfile: HttpResponse;
      let user: UserDto;
      beforeEach(async () => {
        userProfile = await controller.getUserInfo(user);
      });

      test('it should call getUserProfileInfo from UserService', () => {
        expect(userService.getUserProfileInfo).toBeCalledWith(user);
      });

      test('it should return', () => {
        const result = new HttpOkResponse(
          userProfile.data,
          message.ProfileInfo,
        );
        expect(userProfile).toStrictEqual(result);
      });
    });
  });

  describe('updateProfileInfo', () => {
    describe('When updateProfileInfo is called', () => {
      let payload: UpdateProfileDto;
      let user: UserDto;
      let response: HttpResponse;
      beforeEach(async () => {
        response = await controller.updateProfileInfo(payload, user);
      });

      test('it should call updateProfileInfo from UserService', () => {
        expect(userService.updateProfileInfo).toBeCalledWith(payload, user);
      });

      test('it should return', () => {
        const result = new HttpOkResponse(
          response.data,
          message.UpdatedProfile,
        );
        expect(response).toStrictEqual(result);
      });
    });
  });

  describe('changePassword', () => {
    describe('When changePassword is called', () => {
      let payload: ChangePasswordDto;
      let user: UserDto;
      let response: HttpResponse;
      beforeEach(async () => {
        response = await controller.changePassword(user, payload);
      });

      test('it should call changeUserPassword from UserService', () => {
        expect(userService.changeUserPassword).toBeCalledWith(user, payload);
      });

      test('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedPassword);
        expect(response).toStrictEqual(result);
      });
    });
  });
});
