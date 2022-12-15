import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import moment from 'moment';
import { FindConditions, getConnection, QueryRunner } from 'typeorm';

import * as message from '../../shared/http/message.http';
import { UserNotFoundException } from '../../shared/exceptions/user-not-found.exception';
import { UtilsService } from '../../shared/providers/utils.service';
import { UserListDto } from '../admin/dto/response/UserListDto';
import { RegisterDto } from '../auth/dto/payload/RegisterDto';
import { SendEmailDto } from '../auth/dto/payload/SendEmailDto';
import { ChangePasswordDto } from './dto/payload/ChangePasswordDto';
import { UpdateProfileDto } from './dto/payload/UpdatePofileDto';
import { UserDto } from './dto/UserDto';
import { UserOtpDto } from './dto/UserOtpDto';
import { UserOTPEntity } from './entities/otp.entity';
import { ProfileEntity } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { ProfileRepository } from './repositories/profile.repository';
import { UserRepository } from './repositories/user.repository';
import { UserOtpRepository } from './repositories/userotp.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import { ConnectionInviteRepository } from '../connection/repositories/connectionInvite.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly userOtpRepository: UserOtpRepository,
    private readonly connectionInviteRepo: ConnectionInviteRepository,

    private logger: LoggerService,
  ) {}

  /**
   * @description Fetches user otp info based on given constrains
   * @param findData {where constraints}
   * @returns {UserEntity} data
   * @author Samsheer Alam
   */
  async findOneUserOtp(
    findData: FindConditions<UserOTPEntity>,
  ): Promise<UserOTPEntity> {
    return this.userOtpRepository.findOne(findData);
  }

  /**
   * @description Fetches user info based on given constrains
   * @param findData {where constraints}
   * @returns {UserEntity} user table data
   * @author Samsheer Alam
   */
  async findOneUser(findData: FindConditions<UserEntity>): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: findData,
      relations: ['profile'],
    });
  }

  /**
   * @description Fetches user profile info based on given constrains
   * @param findData {where constraints}
   * @returns {UserEntity} data
   * @author Samsheer Alam
   */
  async findOneUserProfile(
    findData: FindConditions<ProfileEntity>,
  ): Promise<ProfileEntity> {
    return this.profileRepository.findOne(findData);
  }

  /**
   * @description Fetches user info based on given constrains
   * called from team service
   * @param emailIds {array of email ids}
   * @returns {UserEntity} user table data
   * @author Samsheer Alam
   */
  async findUsersByEmailIds(emailIds: string[]): Promise<UserEntity[]> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .where('user.email  IN (:...emailIds)', {
          emailIds: emailIds,
        })
        .andWhere('user.password is not null')
        .select(['email'])
        .execute();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches user profile information
   * called from skill service
   * @param user Logged in user info
   * @returns {ProfileEntity} profile table data
   * @author Samsheer Alam
   */
  async getUserProfile(user: UserDto): Promise<ProfileEntity> {
    return this.profileRepository.findOne({ user });
  }

  /**
   * @description Updates data in user table
   * @param updateData {UserEntity} data
   * @returns {UserEntity} data
   * @author Samsheer Alam
   */
  async updateUserInfo(updateData: UserDto): Promise<UserEntity> {
    return this.userRepository.save(updateData);
  }

  /**
   * @description Updates data in UserOtp table
   * @param updateData {UserOTPEntity} data
   * @returns {UserOTPEntity} data
   * @author Samsheer Alam
   */
  async updateUserOTP(updateData: UserOtpDto): Promise<UserOTPEntity> {
    return this.userOtpRepository.save(updateData);
  }

  /**
   * @description Updates otp record for user and saves in userOtpRepository
   * This is called from sendEmailOtp if otp is  not stored before.(that is for first time)
   * @param saveData {SendEmailDto} data
   * @returns {UserOTPEntity} data
   * @author Samsheer Alam
   */
  async saveUserOTP(
    saveData: SendEmailDto,
    generatedOTP: number,
  ): Promise<UserOTPEntity> {
    try {
      const otpData = {
        email: saveData.email,
        emailOtp: generatedOTP,
        emailOtpSendAt: moment().format(),
      };

      const otpRef = this.userOtpRepository.create(otpData);
      return this.userOtpRepository.save(otpRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from registerUserInfo function to insert record in user table
   * @param queryRunner QueryRunner instance to insert record in user table with given transaction reference
   * @param registerPayload {RegisterDto}
   * @returns Created user info
   */
  async createUser(
    queryRunner: QueryRunner,
    registerPayload: RegisterDto,
  ): Promise<UserDto> {
    try {
      const userData = {
        email: registerPayload.email,
        firstName: registerPayload.firstName,
        lastName: registerPayload.lastName,
        password: registerPayload.password,
        invitedBy: registerPayload.invitedBy,
      };
      const userCreatedRef = this.userRepository.create(userData);
      return await queryRunner.manager.save(userCreatedRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from registerUserInfo function to insert record in user_profile table
   * @param queryRunner QueryRunner instance to insert record in profile table with given transaction reference
   * @param registerPayload {RegisterDto}
   * @param userResult User info
   * @returns Created user profile info
   */
  async createUserProfile(
    queryRunner: QueryRunner,
    registerPayload: RegisterDto,
    userResult: UserDto,
  ): Promise<ProfileEntity> {
    try {
      const profileInfo = {
        user: userResult,
        profileImage: registerPayload.profileImage,
        hourlyRate: registerPayload.hourlyRate,
        about: registerPayload.about,
        externalLinks: registerPayload.externalLink,
        address: registerPayload.address,
        state: registerPayload.state,
        country: registerPayload.country,
        phoneNumber: registerPayload.phoneNumber,
        personalWebsite: registerPayload.personalWebsite,
      };
      const userCreatedProfile = this.profileRepository.create(profileInfo);
      return await queryRunner.manager.save(userCreatedProfile);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from auth service to register a user and save registeration screen data
   * @param registerPayload {RegisterDto}
   * @param userOTPInfo {UserOtpDto}
   * @returns Saved user info {UserDto}
   * @author Samsheer Alam
   */
  async registerUserInfo(
    registerPayload: RegisterDto,
    userOTPInfo: UserOtpDto,
  ): Promise<UserDto> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    let userResult: UserDto;
    try {
      userResult = await this.createUser(queryRunner, registerPayload);
      await this.createUserProfile(queryRunner, registerPayload, userResult);

      userOTPInfo.user = userResult.id;
      await queryRunner.manager.save(userOTPInfo);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new ConflictException(message.UserAlreadyExists);
      }
      throw new InternalServerErrorException(message.InternalServer);
    } finally {
      await queryRunner.release();
    }
    return userResult;
  }

  /**
   * @description To fetch all information required for profile screen
   * @param user Logged in user info
   * @returns UserListDto User table data along with profile information
   * @author Samsheer Alam
   */
  async getUserProfileInfo(user: UserDto): Promise<UserListDto> {
    try {
      const userInfo = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['profile', 'discourse'],
      });
      if (userInfo === undefined) {
        throw new UserNotFoundException();
      }
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
        .getCount();
      return {
        userId: userInfo?.id || '',
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        email: userInfo?.email || '',
        status: userInfo?.status || false,
        profileImage: userInfo?.profile?.profileImage || '',
        hourlyRate: userInfo?.profile?.hourlyRate || 0,
        about: userInfo?.profile?.about || '',
        externalLinks: userInfo?.profile?.externalLinks || '',
        address: userInfo?.profile?.address || '',
        state: userInfo?.profile?.state || '',
        country: userInfo?.profile?.country || '',
        phoneNumber: userInfo?.profile?.phoneNumber || '',
        personalWebsite: userInfo?.profile?.personalWebsite || '',
        createdAt: userInfo?.createdAt || '',
        connectionCount: connections,
        reputationScore:
          userInfo?.profile?.reputationScore === undefined
            ? null
            : userInfo?.profile?.reputationScore === null
            ? null
            : Number(userInfo?.profile?.reputationScore),
        // < 300
        // ? 300
        // : Number(userInfo?.profile?.reputationScore),
        isDiscourseUser:
          userInfo?.discourse === undefined || userInfo?.discourse === null
            ? false
            : true,
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if email and phonenumber is verfied in case email and phone is changed. And updates all the profile info
   * @param updatePayload UpdateProfileDto data
   * @param user {UserDto} Logged in user info
   * @author Samsheer Alam
   */
  async updateProfileInfo(
    updatePayload: UpdateProfileDto,
    user: UserDto,
  ): Promise<void> {
    const otpInfo = await this.userOtpRepository.findOne({ user: user.id });

    if (
      otpInfo?.email !== updatePayload.email ||
      otpInfo?.phoneNumber !== updatePayload.phoneNumber ||
      !otpInfo?.isEmailVerified ||
      !otpInfo.isPhoneVerified
    ) {
      throw new BadRequestException(message.EmailOrPhoneUnverified);
    }
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      user.firstName = updatePayload.firstName;
      user.lastName = updatePayload.lastName;
      await queryRunner.manager.save(user);

      const profileInfo = await this.profileRepository.findOne({ user });
      profileInfo.profileImage = updatePayload.profileImage;
      profileInfo.hourlyRate = updatePayload.hourlyRate;
      profileInfo.about = updatePayload.about;
      profileInfo.externalLinks = updatePayload.externalLink;
      profileInfo.address = updatePayload.address;
      profileInfo.state = updatePayload.state;
      profileInfo.country = updatePayload.country;
      profileInfo.phoneNumber = updatePayload.phoneNumber;
      profileInfo.personalWebsite = updatePayload.personalWebsite;
      await queryRunner.manager.save(profileInfo);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(message.InternalServer);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @description Validates the currentPassword and then updates the given password
   * @param user Logged in user info
   * @param payload ChangePasswordDto {password, confirmPassword, currentPassword}
   * @returns Updated userInfo
   * @author Samsheer Alam
   */
  async changeUserPassword(user: UserDto, payload: ChangePasswordDto) {
    try {
      const userInfo = await this.findOneUser({ id: user.id, status: true });
      const isPasswordValid = await UtilsService.validateHash(
        payload.currentPassword,
        userInfo?.password,
      );
      if (!userInfo) {
        throw new UserNotFoundException();
      }
      if (!isPasswordValid) {
        throw new NotFoundException(message.InvalidPassword);
      }
      userInfo.password = payload.password;
      return await this.userRepository.save(userInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
