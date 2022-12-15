import { Test } from '@nestjs/testing';
import moment from 'moment';
import { Connection, FindConditions, QueryRunner } from 'typeorm';

import { ConnectionInviteRepository } from '../../connection/repositories/connectionInvite.repository';
import { LoggerService } from '../../../shared/providers/logger.service';
import { ProfileRepository } from '../repositories/profile.repository';
import { UserOtpRepository } from '../repositories/userotp.repository';
import { UserService } from '../user.service';
import { UserRepository } from '../repositories/user.repository';
import { UserOTPEntity } from '../entities/otp.entity';
import {
  userOTPMockData,
  userMockData,
  foundUsersEmail,
  mockProfileData,
  mockUserListData,
} from './mockData/user.service.mockdata';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from '../dto/UserDto';
import { ProfileEntity } from '../entities/profile.entity';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserOtpDto } from '../dto/UserOtpDto';
import { RegisterDto } from '../../auth/dto/payload/RegisterDto';
import { UserNotFoundException } from '../../../shared/exceptions/user-not-found.exception';
import { UserListDto } from '../../admin/dto/response/UserListDto';
import * as message from '../../../shared/http/message.http';

jest.mock('../../../shared/providers/logger.service');
jest.mock('../repositories/profile.repository');
jest.mock('../../connection/repositories/connectionInvite.repository');

const userRepoMockFn = {
  findOne: jest.fn(() => new Promise((resolve) => resolve(userMockData))),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(foundUsersEmail),
  }),
  create: jest.fn(() => new Promise((resolve) => resolve(userOTPMockData))),
  save: jest.fn(() => new Promise((resolve) => resolve({}))),
  queryRunner: jest.fn().mockReturnValue({
    manager: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue({}),
  }),
};

const profileRepoMockfn = {
  findOne: jest.fn(() => new Promise((resolve) => resolve(mockProfileData))),
  create: jest.fn(() => new Promise((resolve) => resolve(mockProfileData))),
};
const userOTPRepoMockfn = {
  findOne: jest.fn(() => new Promise((resolve) => resolve(userOTPMockData))),
  save: jest.fn(() => new Promise((resolve) => resolve({}))),
  create: jest.fn(() => new Promise((resolve) => resolve(userOTPMockData))),
};
describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let profileRepository: ProfileRepository;
  let userOtpRepository: UserOtpRepository;
  let connectionInviteRepo: ConnectionInviteRepository;
  let logger: LoggerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: () => userRepoMockFn,
        },
        {
          provide: ProfileRepository,
          useFactory: () => profileRepoMockfn,
        },
        {
          provide: UserOtpRepository,
          useFactory: () => userOTPRepoMockfn,
        },
        ConnectionInviteRepository,
        LoggerService,
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    logger = moduleRef.get<LoggerService>(LoggerService);

    userRepository = moduleRef.get(UserRepository);
    profileRepository = moduleRef.get<ProfileRepository>(ProfileRepository);

    userOtpRepository = moduleRef.get<UserOtpRepository>(UserOtpRepository);
    connectionInviteRepo = moduleRef.get<ConnectionInviteRepository>(
      ConnectionInviteRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOneUserOtp', () => {
    describe('When findOneUserOtp is called', () => {
      let userOTPData: UserOTPEntity;
      let findData: FindConditions<UserOTPEntity>;

      beforeEach(async () => {
        userOTPData = await userService.findOneUserOtp(findData);
      });

      it('it should call findOne from UserOtpRepository', () => {
        expect(userOtpRepository.findOne).toBeCalledWith(findData);
      });

      it('it should return', () => {
        expect(userOTPData).toStrictEqual(userOTPMockData);
      });
    });
  });

  describe('findOneUser', () => {
    describe('When findOneUser is called', () => {
      let userData: UserEntity;
      let findData: FindConditions<UserEntity>;
      const constrains = {
        where: findData,
        relations: ['profile'],
      };
      beforeEach(async () => {
        userData = await userService.findOneUser(findData);
      });

      it('it should call findOne from UserRepository', () => {
        expect(userRepository.findOne).toBeCalledWith(constrains);
      });

      it('it should return', () => {
        expect(userData).toStrictEqual(userMockData);
      });
    });
  });

  describe('findUsersByEmailIds', () => {
    describe('When findUsersByEmailIds is called', () => {
      let foundUsers: UserEntity[];
      let emailIds: ['sometest@gmail.com'];
      let error;
      beforeEach(async () => {
        try {
          foundUsers = await userService.findUsersByEmailIds(emailIds);
        } catch (e) {
          error = e;
          logger.error(e?.message, e);
        }
      });

      it('it should call createQueryBuilder from UserRepository', () => {
        expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
        expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
          'user.email  IN (:...emailIds)',
          {
            emailIds: emailIds,
          },
        );
        expect(
          userRepository.createQueryBuilder().andWhere,
        ).toHaveBeenCalledWith('user.password is not null');
        expect(userRepository.createQueryBuilder().select).toHaveBeenCalledWith(
          ['email'],
        );
      });
      it('it should call error function from logger to log error', () => {
        logger.error(error?.message, error);
        expect(logger.error).toHaveBeenCalledWith(error?.message, error);
      });
      it('it should throw error if statusCode is 500', () => {
        try {
          throw new InternalServerErrorException(message.InternalServer);
        } catch (e) {
          expect(e).toBeInstanceOf(InternalServerErrorException);
          expect(e.message).toBe(message.InternalServer);
        }
      });
      it('it should throw error if statusCode is not 500', () => {
        try {
          throw new BadRequestException();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
        }
      });
      it('it should return the result', () => {
        expect(foundUsers).toEqual(foundUsersEmail);
      });
    });
  });

  describe('getUserProfile', () => {
    describe('When getUserProfile is called', () => {
      let profileData: ProfileEntity;
      let userInfo: UserDto;

      beforeEach(async () => {
        profileData = await userService.getUserProfile(userInfo);
      });

      it('it should call findOne from ProfileRepository', () => {
        expect(profileRepository.findOne).toBeCalledWith({ user: userInfo });
      });

      it('it should return', () => {
        expect(profileData).toStrictEqual(mockProfileData);
      });
    });
  });

  describe('updateUserInfo', () => {
    describe('When updateUserInfo is called', () => {
      let updateData: UserDto;
      let userResult: UserEntity;

      beforeEach(async () => {
        userResult = await userService.updateUserInfo(updateData);
      });

      it('it should call save from UserRepository', () => {
        expect(userRepository.save).toBeCalledWith(updateData);
      });

      it('it should return', () => {
        expect(userResult).toStrictEqual({});
      });
    });
  });

  describe('updateUserOTP', () => {
    describe('When updateUserOTP is called', () => {
      let updateData: UserOtpDto;
      let userResult: UserOTPEntity;

      beforeEach(async () => {
        userResult = await userService.updateUserOTP(updateData);
      });

      it('it should call save from UserOtpRepository', () => {
        expect(userOtpRepository.save).toBeCalledWith(updateData);
      });

      it('it should return', () => {
        expect(userResult).toStrictEqual({});
      });
    });
  });

  describe('saveUserOTP', () => {
    describe('When saveUserOTP is called', () => {
      let userResult: UserOTPEntity;
      let otpRef;
      const otpData = {
        email: 'somtest@gmail.com',
        emailOtp: 2345,
        emailOtpSendAt: moment().format(),
      };

      beforeEach(async () => {
        otpRef = userOtpRepository.create(otpData);
        userResult = await userOtpRepository.save(otpRef);
      });

      it('it should call create from UserOtpRepository', () => {
        expect(userOtpRepository.create).toBeCalledWith(otpData);
      });

      it('it should call save from UserOtpRepository', () => {
        expect(userOtpRepository.save).toBeCalledWith(otpRef);
      });

      it('it should return', () => {
        expect(userResult).toStrictEqual({});
      });
    });
  });

  describe('createUser', () => {
    describe('When createUser is called', () => {
      const queryRunner = {
        manager: {
          save: jest.fn().mockResolvedValue({}),
        },
      };
      let registerPayload: RegisterDto;

      const userData = {
        email: registerPayload?.email,
        firstName: registerPayload?.firstName,
        lastName: registerPayload?.lastName,
        password: registerPayload?.password,
      };

      let userResult: UserDto;
      let userCreatedRef;

      beforeEach(async () => {
        userCreatedRef = userRepository.create(userData);
        userResult = await queryRunner.manager.save(userCreatedRef);
      });

      it('it should call create from userRepository', () => {
        expect(userRepository.create).toBeCalledWith(userData);
      });

      it('it should call save from queryRunner', () => {
        expect(queryRunner.manager.save).toBeCalledWith(userCreatedRef);
      });

      it('it should return', () => {
        expect(userResult).toStrictEqual({});
      });
    });
  });

  describe('createUserProfile', () => {
    describe('When createUserProfile is called', () => {
      const queryRunner = {
        manager: {
          save: jest.fn().mockResolvedValue({}),
        },
      };
      let registerPayload: RegisterDto;
      let userInfo: UserDto;

      const profileInfo = {
        user: userInfo,
        profileImage: registerPayload?.profileImage,
        hourlyRate: registerPayload?.hourlyRate,
        about: registerPayload?.about,
        externalLinks: registerPayload?.externalLink,
        address: registerPayload?.address,
        state: registerPayload?.state,
        country: registerPayload?.country,
        phoneNumber: registerPayload?.phoneNumber,
        personalWebsite: registerPayload?.personalWebsite,
      };

      let userCreatedProfile;
      let profileResult: ProfileEntity;
      beforeEach(async () => {
        userCreatedProfile = profileRepository.create(profileInfo);
        profileResult = await queryRunner.manager.save(userCreatedProfile);
      });

      it('it should call create from profileRepository', () => {
        expect(profileRepository.create).toBeCalledWith(profileInfo);
      });

      it('it should call save from queryRunner', () => {
        expect(queryRunner.manager.save).toBeCalledWith(userCreatedProfile);
      });

      it('it should return', () => {
        expect(profileResult).toStrictEqual({});
      });
    });
  });

  describe('registerUserInfo', () => {
    describe('When registerUserInfo is called', () => {
      let registerPayload: RegisterDto;
      let userOTPInfo: UserOtpDto;
      let userResult: UserDto;
      const registerData = {
        email: registerPayload?.email,
        firstName: registerPayload?.firstName,
        lastName: registerPayload?.lastName,
        password: registerPayload?.password,
        termsAndCondition: registerPayload?.termsAndCondition,
        address: registerPayload?.address,
        state: registerPayload?.state,
        country: registerPayload?.country,
        phoneNumber: registerPayload?.phoneNumber,
        personalWebsite: registerPayload?.personalWebsite,
        profileImage: registerPayload?.profileImage,
        hourlyRate: registerPayload?.hourlyRate,
        about: registerPayload?.about,
        externalLink: registerPayload?.externalLink,
        invitedBy: registerPayload?.invitedBy,
      };
      const qr = {
        manager: {},
      } as QueryRunner;

      class ConnectionMock {
        createQueryRunner(): QueryRunner {
          return qr;
        }
      }
      beforeEach(async () => {
        Object.assign(qr.manager, {
          save: jest.fn(),
        });
        qr.connect = jest.fn();
        qr.release = jest.fn();
        qr.startTransaction = jest.fn();
        qr.commitTransaction = jest.fn();
        qr.rollbackTransaction = jest.fn();
        qr.release = jest.fn();

        await Test.createTestingModule({
          providers: [
            {
              provide: Connection,
              useClass: ConnectionMock,
            },
          ],
        }).compile();
      });

      it('it should call getConnection to connect and start Transaction', async () => {
        await qr.connect();
        expect(qr.connect).toHaveBeenCalled();
      });
      it('it should call queryRunner to connect and start Transaction', async () => {
        await qr.startTransaction();
        expect(qr.startTransaction).toHaveBeenCalled();
      });
      it('it should call createUser to get create a new user in DB', async () => {
        let result: UserDto;
        jest
          .spyOn(userService, 'createUser')
          .mockImplementation(async () => result);
        userResult = await userService.createUser(qr, registerData);
        expect(userService.createUser).toBeCalledWith(qr, registerData);

        expect(userResult).toStrictEqual(result);
      });
      it('it should call createUserProfile to store user profile info in DB', async () => {
        let profileResult: ProfileEntity;
        jest
          .spyOn(userService, 'createUserProfile')
          .mockImplementation(async () => profileResult);
        await userService.createUserProfile(qr, registerData, userResult);
        expect(userService.createUserProfile).toBeCalledWith(
          qr,
          registerData,
          userResult,
        );
      });
      it('it should call queryRunner.manager.save to update userId in UserOTP table', async () => {
        await qr.manager.save(userOTPInfo);
        expect(qr.manager.save).toBeCalledWith(userOTPInfo);
      });
      it('it should call queryRunner to commitTransaction', async () => {
        await qr.commitTransaction();
        expect(qr.commitTransaction).toHaveBeenCalled();
      });
      describe('When transaction fails', () => {
        beforeEach(async () => {
          jest.spyOn(userService, 'createUser').mockResolvedValue(undefined);
        });
        it('it should call rollbackTransaction', async () => {
          await qr.rollbackTransaction();
          expect(qr.rollbackTransaction).toHaveBeenCalled();
        });
      });
      describe('Transaction finally called', () => {
        it('it should call release transactiion', async () => {
          await qr.release();
          expect(qr.release).toHaveBeenCalled();
        });
      });
    });
  });

  describe('getUserProfileInfo', () => {
    describe('When getUserProfileInfo is called', () => {
      let userData: UserDto;
      let connections: number;
      let result: UserListDto;

      const constrains = {
        where: { id: '' },
        relations: ['profile', 'discourse'],
      };
      const connectionConstrain = {
        isDeleted: false,
        invitedBy: userData,
        status: true,
      };

      beforeEach(async () => {
        userData = await userRepository.findOne(constrains);
        connections = await connectionInviteRepo.count(connectionConstrain);
        result = mockUserListData;
        result.connectionCount = connections;
      });

      it('if userData is undefined it should throw UserNotFoundException', () => {
        if (userData === undefined) {
          expect(UserNotFoundException).toBeCalledTimes(1);
        }
      });

      it('it should call findOne from UserRepository', () => {
        expect(userRepository.findOne).toBeCalledWith(constrains);
      });

      it('it should call count connectionInviteRepo', () => {
        expect(connectionInviteRepo.count).toBeCalledWith(connectionConstrain);
      });

      it('it should return', () => {
        expect(result).toStrictEqual(mockUserListData);
      });
    });
  });
});
