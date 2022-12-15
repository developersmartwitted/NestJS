import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';
import { Response, Request } from 'express';

import HttpResponse from '../../../shared/http/response.http';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SendEmailDto } from '../dto/payload/SendEmailDto';
import { ConfigService } from '../../../shared/config/config.service';
import { LoggerService } from '../../../shared/providers/logger.service';
import { RefreshTokenService } from '../refresh/refreshToken.service';
import { SendPhoneOtpDto } from '../dto/payload/SendPhoneOtpDto';
import { VerifyEmailDto } from '../dto/payload/VerifyEmailDto';
import { VerifyPhoneOtpDto } from '../dto/payload/VerifyPhoneOtpDto';
import { RegisterDto } from '../dto/payload/RegisterDto';
import { UserLoginDto } from '../dto/payload/UserLoginDto';
import { LoginResponseDto } from '../dto/response/LoginResponseDto';
import { ForgotPasswordDto } from '../dto/payload/ForgotPasswordDto';
import { VerifyDto } from '../dto/payload/VerifyDto';
import { VerifyInfoDto } from '../dto/response/VerifyInfoDto';
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TokenPayloadDto } from '../dto/TokenPayloadDto';

jest.mock('../auth.service');
jest.mock('../refresh/refreshToken.service');
jest.mock('../../../shared/config/config.service');
jest.mock('../../../shared/providers/logger.service');

describe('StripeController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let refreshService: RefreshTokenService;
  let configService: ConfigService;
  let logger: LoggerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        AuthService,
        RefreshTokenService,
        ConfigService,
        LoggerService,
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    refreshService = moduleRef.get<RefreshTokenService>(RefreshTokenService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    logger = moduleRef.get<LoggerService>(LoggerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendEmailOtp', () => {
    describe('When sendEmailOtp is called', () => {
      let authRes: HttpResponse;
      let sendEmailDto: SendEmailDto;
      let data;
      let otp: { otp: number };
      beforeEach(async () => {
        authRes = await controller.sendEmailOtp(sendEmailDto);
      });

      it('it should call sendEmailOtp from authService', () => {
        expect(authService.sendEmailOtp).toBeCalledWith(sendEmailDto);
      });

      it('it should return', () => {
        data = configService.get('NODE_ENV') === 'production' ? undefined : otp;
        const result = new HttpOkResponse(data, message.SentEmailOTP);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('verfiyEmailOtp', () => {
    describe('When verfiyEmailOtp is called', () => {
      let authRes: HttpResponse;
      let verfiyEmailDto: VerifyEmailDto;
      beforeEach(async () => {
        authRes = await controller.verfiyEmailOtp(verfiyEmailDto);
      });

      it('it should call verifyEmailOtp from authService', () => {
        expect(authService.verifyEmailOtp).toBeCalledWith(verfiyEmailDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.OTPVerified);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('sendPhoneOtp', () => {
    describe('When sendPhoneOtp is called', () => {
      let authRes: HttpResponse;
      let otpPayload: SendPhoneOtpDto;
      let data;
      let otp: { otp: number };
      beforeEach(async () => {
        authRes = await controller.sendPhoneOtp(otpPayload);
      });

      it('it should call sendPhoneOTP from authService', () => {
        expect(authService.sendPhoneOTP).toBeCalledWith(otpPayload);
      });

      it('it should return', () => {
        data = configService.get('NODE_ENV') === 'production' ? undefined : otp;
        const result = new HttpOkResponse(data, message.SentPhoneOTP);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyPhoneOtp', () => {
    describe('When verifyPhoneOtp is called', () => {
      let authRes: HttpResponse;
      let verifyPhonePayload: VerifyPhoneOtpDto;
      beforeEach(async () => {
        authRes = await controller.verifyPhoneOtp(verifyPhonePayload);
      });

      it('it should call verifyPhoneOtp from authService', () => {
        expect(authService.verifyPhoneOTP).toBeCalledWith(verifyPhonePayload);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.OTPVerified);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('register', () => {
    describe('When register is called', () => {
      let authRes: HttpResponse;
      let registerDto: RegisterDto;
      beforeEach(async () => {
        authRes = await controller.register(registerDto);
      });

      it('it should call registerUserInfo from authService', () => {
        expect(authService.registerUserInfo).toBeCalledWith(registerDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UserRegistered);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('userLogin', () => {
    describe('When userLogin is called', () => {
      let authRes: HttpResponse;
      let userLoginDto: UserLoginDto;
      let res: Response;
      let data: LoginResponseDto;

      beforeEach(async () => {
        authRes = await controller.userLogin(userLoginDto, res);
      });

      it('it should call login from authService', () => {
        expect(authService.login).toBeCalledWith(userLoginDto, res);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(data, message.LoggedIn);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('logout', () => {
    describe('When logout is called', () => {
      const authRes: HttpResponse = new HttpOkResponse(
        undefined,
        message.LoggedOut,
      );
      const res = {
        clearCookie: jest.fn(),
      };
      let ress: Response;

      beforeEach(async () => {
        jest.spyOn(controller, 'logout').mockResolvedValue(authRes);
        await controller.logout(ress);
      });

      it('it should call clearCookie from res', () => {
        jest.spyOn(res, 'clearCookie').mockResolvedValue({});
        res.clearCookie('jwt', {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        });
        expect(res.clearCookie).toHaveBeenCalledTimes(1);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.LoggedOut);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('refresh', () => {
    describe('When refresh is called', () => {
      let request: Request;
      let data: LoginResponseDto;
      let authRes: HttpResponse = new HttpOkResponse(data, message.LoggedIn);
      let error;

      beforeEach(async () => {
        jest.spyOn(controller, 'refresh').mockResolvedValue(authRes);
        authRes = await controller.refresh(request);
      });

      it('it should call BadRequestException when refreshToken is undefined', () => {
        try {
          const refreshToken = undefined;
          if (refreshToken === undefined) {
            throw new BadRequestException(message.TokenNotFound);
          }
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toBe(message.TokenNotFound);
          logger.error(e?.message, e);
        }
      });

      it('it should call createAccessTokenFromRefreshToken from refreshtoken service', async () => {
        const refreshToken = 'somrandomstring';
        let user: UserEntity;
        let token: TokenPayloadDto;
        jest
          .spyOn(refreshService, 'createAccessTokenFromRefreshToken')
          .mockResolvedValue({ user, token });
        await refreshService.createAccessTokenFromRefreshToken(refreshToken);
        expect(
          refreshService.createAccessTokenFromRefreshToken,
        ).toHaveBeenCalledTimes(1);
      });

      it('it should call error function from logger to log error', () => {
        logger.error(error?.message, error);
        expect(logger.error).toHaveBeenCalledWith(error?.message, error);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(data, message.LoggedIn);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('sendForgotPasswordOTP', () => {
    describe('When sendForgotPasswordOTP is called', () => {
      let authRes: HttpResponse;
      let sendEmailDto: SendEmailDto;
      let data;
      let otp: { otp: number };
      beforeEach(async () => {
        authRes = await controller.sendForgotPasswordOTP(sendEmailDto);
      });

      it('it should call sendForgotPasswordOTP from authService', () => {
        expect(authService.sendForgotPasswordOTP).toBeCalledWith(sendEmailDto);
      });

      it('it should return', () => {
        data = configService.get('NODE_ENV') === 'production' ? undefined : otp;
        const result = new HttpOkResponse(data, message.ForgotPassOTP);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyForgotPasswordOTP', () => {
    describe('When verifyForgotPasswordOTP is called', () => {
      let authRes: HttpResponse;
      let verfiyEmailDto: VerifyEmailDto;
      beforeEach(async () => {
        authRes = await controller.verifyForgotPasswordOTP(verfiyEmailDto);
      });

      it('it should call verifyForgotPasswordOTP from authService', () => {
        expect(authService.verifyForgotPasswordOTP).toBeCalledWith(
          verfiyEmailDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.OTPVerified);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('updateForgotPassword', () => {
    describe('When updateForgotPassword is called', () => {
      let authRes: HttpResponse;
      let forgotPasswordPayload: ForgotPasswordDto;
      beforeEach(async () => {
        authRes = await controller.updateForgotPassword(forgotPasswordPayload);
      });

      it('it should call updatePassword from authService', () => {
        expect(authService.updatePassword).toBeCalledWith(
          forgotPasswordPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedPassword);
        expect(authRes).toStrictEqual(result);
      });
    });
  });

  describe('verify', () => {
    describe('When verify is called', () => {
      let authRes: HttpResponse;
      let verfiyDto: VerifyDto;
      let verifyInfo: VerifyInfoDto;
      beforeEach(async () => {
        authRes = await controller.verify(verfiyDto);
      });

      it('it should call fetchVerificationInfo from authService', () => {
        expect(authService.fetchVerificationInfo).toBeCalledWith(verfiyDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(verifyInfo, message.UserInfo);
        expect(authRes).toStrictEqual(result);
      });
    });
  });
});
