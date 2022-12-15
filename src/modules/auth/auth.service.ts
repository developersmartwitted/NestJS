import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import moment from 'moment';
import { Response } from 'express';

import * as message from '../../shared/http/message.http';
import { UserNotFoundException } from '../../shared/exceptions/user-not-found.exception';
import { UtilsService } from '../../shared/providers/utils.service';
import { SMSService } from '../../shared/providers/sms.service';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '../../shared/config/config.service';
import { VerifyEmailDto } from './dto/payload/VerifyEmailDto';
import { SendEmailDto } from './dto/payload/SendEmailDto';
import { RegisterDto } from './dto/payload/RegisterDto';
import { UserLoginDto } from './dto/payload/UserLoginDto';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import { VerifyPhoneOtpDto } from './dto/payload/VerifyPhoneOtpDto';
import { SendPhoneOtpDto } from './dto/payload/SendPhoneOtpDto';
import { ForgotPasswordDto } from './dto/payload/ForgotPasswordDto';
import { NotificationService } from '../notification/notification.service';
import { VerifyDto } from './dto/payload/VerifyDto';
import { UserOTPEntity } from '../user/entities/otp.entity';
import { LoginResponseDto } from './dto/response/LoginResponseDto';
import { UserOtpDto } from '../user/dto/UserOtpDto';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/entities/user.entity';
import { VerifyInfoDto } from './dto/response/VerifyInfoDto';
import { ReputationService } from '../reputation/reputation.service';
import { RefreshTokenRepository } from './repositories/refreshToken.repository';
import { CommunityService } from '../community/community.service';
import { LoggerService } from '../../shared/providers/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private notificationService: NotificationService,
    private refreshTokenRepo: RefreshTokenRepository,
    private mailService: MailService,
    private smsService: SMSService,
    private logger: LoggerService,
    private configService: ConfigService,
    private reputationService: ReputationService,
    private communityService: CommunityService,
  ) {}

  /**
   * @description Verify if email is not registered and Send Otp to given email.
   * This function is called when user enters email and click signup or resend email otp is clicked.
   * @param sendEmailDto {email : string}
   * @returns {otp} four digit otp number
   * @author Samsheer Alam
   */
  async sendEmailOtp(sendEmailDto: SendEmailDto): Promise<{ otp: number }> {
    try {
      const { email } = sendEmailDto;
      const otpInfo = await this.getUserOTPInfo(email, 'email');
      const generatedOtp = UtilsService.generateOTP();

      if (otpInfo === undefined) {
        await this.userService.saveUserOTP(sendEmailDto, generatedOtp);
      } else {
        otpInfo.emailOtp = generatedOtp;
        otpInfo.emailOtpSendAt = new Date(moment().format());
        await this.userService.updateUserOTP(otpInfo);
      }
      this.mailService.sendEmailOTP(sendEmailDto.email, generatedOtp);

      return { otp: generatedOtp };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if OTP is sent to email, and validates the given OTP and updates as verified
   * @param verfiyEmailDto {email :string, otp: number }
   */
  async verifyEmailOtp(verfiyEmailDto: VerifyEmailDto): Promise<void> {
    try {
      const { email, otp } = verfiyEmailDto;
      const otpInfo = await this.getUserOTPInfo(email, 'email');

      if (otpInfo === undefined) {
        throw new BadRequestException(message.OTPNotSent);
      }
      const diff = moment
        .duration(moment().diff(otpInfo.emailOtpSendAt))
        .asMinutes();

      if (otpInfo.emailOtp !== otp || diff > 30) {
        throw new BadRequestException(message.InvalidOTP);
      }
      otpInfo.isEmailVerified = true;
      await this.userService.updateUserOTP(otpInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if email is verfied and then sends OTP to phonenNumber as SMS
   * @param otpPayload {email: string, phoneNumber: string}
   * @returns {otp} four digit otp number
   * @author Samsheer Alam
   */
  async sendPhoneOTP(otpPayload: SendPhoneOtpDto): Promise<{ otp: number }> {
    try {
      const { email, phoneNumber } = otpPayload;
      const ifPhoneExist = await this.userService.findOneUserProfile({
        phoneNumber,
      });
      if (ifPhoneExist !== undefined) {
        throw new BadRequestException(
          'Phone number already registered with another email.',
        );
      }
      const otpInfo = await this.getUserOTPInfo(email, 'phone');
      const generatedOtp = UtilsService.generateOTP();

      otpInfo.isPhoneVerified = false;
      otpInfo.phoneNumber = phoneNumber;
      otpInfo.phoneOtp = generatedOtp;
      otpInfo.phoneOtpSendAt = new Date(moment().format());
      await this.userService.updateUserOTP(otpInfo);

      const smsData = {
        message: `${generatedOtp} is your Panoton OTP to verify your phone number`,
        phoneNumber,
      };

      this.smsService.sendSms(smsData);
      return { otp: generatedOtp };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if email is registered and then verifies the sms OTP.
   * @param verifyPhonePayload {email: string, phoneNumber: string, otp: number}
   * @author Samsheer Alam
   */
  async verifyPhoneOTP(verifyPhonePayload: VerifyPhoneOtpDto): Promise<void> {
    try {
      const { email, phoneNumber, otp } = verifyPhonePayload;
      const ifPhoneExist = await this.userService.findOneUserProfile({
        phoneNumber,
      });
      if (ifPhoneExist !== undefined) {
        throw new BadRequestException(
          'Phone number already registered with another email.',
        );
      }
      const otpInfo = await this.getUserOTPInfo(email, 'phone');

      const diff = moment
        .duration(moment().diff(otpInfo.phoneOtpSendAt))
        .asMinutes();
      if (
        otpInfo.phoneNumber !== phoneNumber ||
        otpInfo.phoneOtp !== otp ||
        diff > 30
      ) {
        throw new BadRequestException(message.InvalidOTP);
      }

      otpInfo.isPhoneVerified = true;
      await this.userService.updateUserOTP(otpInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the user's otp info
   * Called within auth servive from sendEmailOtp, verifyEmailOtp
   * @param email - Email Id of the user whose OTP info is fetched
   * @param type - email or phone { This is differentiate from which function it is called}
   * @returns throws error if email is already verified or else returns the result
   */
  async getUserOTPInfo(email: string, type: string): Promise<UserOTPEntity> {
    try {
      const otpInfo = await this.userService.findOneUserOtp({ email });
      const userInfo = await this.userService.findOneUser({ email });

      if (type == 'email') {
        if (userInfo !== undefined) {
          throw new BadRequestException(message.UserAlreadyExists);
        }
        if (userInfo === undefined && otpInfo?.isEmailVerified) {
          throw new BadRequestException(message.OTPAlreadyVerified);
        }
      }
      if (type === 'phone' && !otpInfo?.isEmailVerified) {
        throw new BadRequestException(message.EmailUnverified);
      }
      if (type === 'phone' && otpInfo?.isPhoneVerified) {
        throw new BadRequestException(message.OTPAlreadyVerified);
      }
      return otpInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Save signup data in user and profile table, called from registeration screen
   * @param payload {RegisterDto} Dto
   * @author Samsheer Alam
   */
  async registerUserInfo(payload: RegisterDto): Promise<void> {
    try {
      const { email, phoneNumber } = payload;
      const otpInfo = await this.userService.findOneUserOtp({ email });

      if (
        otpInfo?.phoneNumber !== phoneNumber ||
        !otpInfo?.isEmailVerified ||
        !otpInfo.isPhoneVerified
      ) {
        throw new BadRequestException(message.EmailOrPhoneUnverified);
      }
      const userInfo = await this.userService.registerUserInfo(
        payload,
        otpInfo,
      );
      await this.notificationService.createNotificationSettings(userInfo);
      await this.notificationService.updateUserInfoInInvites(userInfo);
      this.reputationService.updateReputationScore(userInfo);
      this.notificationService.saveInvitesAsNotifications(userInfo);
      this.communityService.createDiscourseUser(userInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Validates user credential and generated token and set refresh token as cookie
   * @param userLoginDto UserLoginDto {email and password}
   * @param res Response in which refresh token is set as cookie
   * @returns Access token and user role
   */
  async login(
    userLoginDto: UserLoginDto,
    res: Response,
  ): Promise<LoginResponseDto> {
    try {
      const userEntity = await this.validateUser(userLoginDto);
      const token = await this.createToken(userEntity);
      const refrehToken = await this.generateRefreshToken(
        userEntity,
        this.configService.getNumber('JWT_EXPIRATION_TIME'),
      );
      res.cookie('jwt', refrehToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: this.configService.getNumber('JWT_EXPIRATION_TIME') * 1000,
      });
      return new LoginResponseDto(token, userEntity.roles[0]);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Saves userId and expiresIn in DB, and returns generated token with expiresIn
   * Called from "login" function (auth service).
   * @param user UserEntity data
   * @param expiresIn Time in seconds in which token gets expired
   * @returns token in string
   * @author Samsheer Alam
   */
  async generateRefreshToken(
    user: UserEntity,
    expiresIn: number,
  ): Promise<string> {
    try {
      const token = await this.refreshTokenRepo.createRefreshToken(
        user,
        expiresIn,
      );
      const opts = {
        expiresIn,
        subject: String(user.id),
        jwtid: String(token.id),
      };
      return this.jwtService.signAsync({}, opts);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if given email is present in DB and also validates the password given by user
   * @param userLoginDto {UserLoginDto} email, password
   * @returns {UserEntity} users table data
   * @author Samsheer Alam
   */
  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    try {
      const user = await this.userService.findOneUser({
        email: userLoginDto.email,
      });
      const isPasswordValid = await UtilsService.validateHash(
        userLoginDto.password,
        user && user.password,
      );
      if (!user) {
        throw new UserNotFoundException();
      }
      if (!user.status) {
        throw new BadRequestException(message.Suspended);
      }
      if (!isPasswordValid) {
        throw new NotFoundException(message.InvalidCredential);
      }
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Calls jwt and generateRefreshToken token functions to generate access token and refresh token
   * @param user  {UserEntity} data
   * @returns {TokenPayloadDto} accessToken
   * @author Samsheer Alam
   */
  async createToken(user: UserEntity): Promise<TokenPayloadDto> {
    try {
      return new TokenPayloadDto({
        accessToken: await this.jwtService.signAsync({ id: user.id }),
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if user is registered and sends OPT to given email for forgot password flow
   * @param sendEmailDto SendEmailDto data {email}
   * @returns success message after sending OTP to email
   * @author Samsheer Alam
   */
  async sendForgotPasswordOTP(
    sendEmailDto: SendEmailDto,
  ): Promise<{ otp: number }> {
    try {
      const { otpInfo } = await this.getOTPDataForForgotPassword(
        sendEmailDto.email,
      );
      const generatedOtp = UtilsService.generateOTP();

      otpInfo.forgotPasswordOtp = generatedOtp;
      otpInfo.passwordOtpSendAt = new Date(moment().format());
      await this.userService.updateUserOTP(otpInfo);

      this.mailService.sendForgotPasswordOTP(sendEmailDto.email, generatedOtp);
      return { otp: generatedOtp };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if user is registered and then validates the given OTP with forgotPasswordOTP in DB
   * @param verfiyEmailDto VerifyEmailDto data {email and OTP}
   * @returns messages if given OTP is matches with forgotPasswordOTP
   * @author Samsheer Alam
   */
  async verifyForgotPasswordOTP(verfiyEmailDto: VerifyEmailDto): Promise<any> {
    try {
      const { email, otp } = verfiyEmailDto;
      const { otpInfo } = await this.getOTPDataForForgotPassword(email);

      const diff = moment
        .duration(moment().diff(otpInfo.passwordOtpSendAt))
        .asMinutes();

      if (otpInfo.forgotPasswordOtp !== otp || diff > 30) {
        throw new BadRequestException(message.InvalidOTP);
      }
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if the otp is valid and then updates the user password from forgotPassword flow
   * @param forgotPasswordPayload ForgotPasswordDto data {email, otp, password, confirmPassword}
   * @returns Success message
   */
  async updatePassword(
    forgotPasswordPayload: ForgotPasswordDto,
  ): Promise<void> {
    try {
      const { email, otp, password } = forgotPasswordPayload;
      const { otpInfo, userInfo } = await this.getOTPDataForForgotPassword(
        email,
      );
      const diff = moment
        .duration(moment().diff(otpInfo.passwordOtpSendAt))
        .asMinutes();

      if (otpInfo.forgotPasswordOtp !== otp || diff > 30) {
        throw new BadRequestException(message.InvalidOTP);
      }
      userInfo.password = password;
      await this.userService.updateUserInfo(userInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from sendForgotPasswordOTP, updatePassword and verifyForgotPasswordOTP function
   * to fetch userotpinfo for user
   * @param email Email for userOTPInfo needs to be fecthed
   * @returns UserOTP data
   */
  async getOTPDataForForgotPassword(
    email: string,
  ): Promise<{ userInfo: UserDto; otpInfo: UserOtpDto }> {
    try {
      const userInfo = await this.userService.findOneUser({
        email,
        status: true,
      });

      const otpInfo = await this.userService.findOneUserOtp({
        user: userInfo?.id,
      });
      if (userInfo === undefined || otpInfo === undefined) {
        throw new UserNotFoundException();
      }
      return { userInfo, otpInfo };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks the given id is there in invite or not and sends if user is registered or not
   * @param verifyDto {question type and verification id}
   * @returns if user is registered or not info, type of question, and verification id
   */
  async fetchVerificationInfo(verifyDto: VerifyDto): Promise<VerifyInfoDto> {
    try {
      return await this.notificationService.getVerficationResult(verifyDto);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
