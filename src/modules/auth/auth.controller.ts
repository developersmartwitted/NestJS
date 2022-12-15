import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Response, Request } from 'express';

import * as message from '../../shared/http/message.http';
import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';

import { AuthService } from './auth.service';
import { SendEmailDto } from './dto/payload/SendEmailDto';
import { VerifyEmailDto } from './dto/payload/VerifyEmailDto';
import { RegisterDto } from './dto/payload/RegisterDto';
import { LoginResponseDto } from './dto/response/LoginResponseDto';
import { UserLoginDto } from './dto/payload/UserLoginDto';
import { SendPhoneOtpDto } from './dto/payload/SendPhoneOtpDto';
import { VerifyPhoneOtpDto } from './dto/payload/VerifyPhoneOtpDto';
import { RefreshTokenService } from './refresh/refreshToken.service';
import { ForgotPasswordDto } from './dto/payload/ForgotPasswordDto';
import { VerifyDto } from './dto/payload/VerifyDto';
import { VerifyInfoDto } from './dto/response/VerifyInfoDto';
import { LoggerService } from '../../shared/providers/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    public readonly authService: AuthService,
    public readonly refreshService: RefreshTokenService,
    private logger: LoggerService,
  ) {}

  @ApiTags('Auth Apis')
  @Post('send-email-otp')
  @ApiOkResponse({ description: message.SentEmailOTP })
  @ApiBadRequestResponse({ description: message.OTPAlreadyVerified })
  async sendEmailOtp(
    @Body() sendEmailDto: SendEmailDto,
  ): Promise<HttpResponse> {
    await this.authService.sendEmailOtp(sendEmailDto);
    return new HttpOkResponse(undefined, message.SentEmailOTP);
  }

  @ApiTags('Auth Apis')
  @Post('verify-email-otp')
  @ApiOkResponse({ description: message.OTPVerified })
  @ApiBadRequestResponse({
    description: `${message.OTPNotSent} (or) ${message.InvalidOTP} (or) ${message.OTPAlreadyVerified}`,
  })
  async verfiyEmailOtp(
    @Body() verfiyEmailDto: VerifyEmailDto,
  ): Promise<HttpResponse> {
    await this.authService.verifyEmailOtp(verfiyEmailDto);
    return new HttpOkResponse(undefined, message.OTPVerified);
  }

  @ApiTags('Auth Apis')
  @Post('send-phone-otp')
  @ApiOkResponse({ description: message.SentPhoneOTP })
  @ApiBadRequestResponse({
    description: `${message.EmailUnverified} (or) ${message.OTPAlreadyVerified}`,
  })
  async sendPhoneOtp(
    @Body() otpPayload: SendPhoneOtpDto,
  ): Promise<HttpResponse> {
    await this.authService.sendPhoneOTP(otpPayload);
    return new HttpOkResponse(undefined, message.SentPhoneOTP);
  }

  @ApiTags('Auth Apis')
  @Post('verify-phone-otp')
  @ApiOkResponse({ description: message.OTPVerified })
  @ApiBadRequestResponse({
    description: `${message.EmailUnverified} (or) ${message.InvalidOTP} (or) ${message.OTPAlreadyVerified}`,
  })
  async verifyPhoneOtp(
    @Body() verifyPhonePayload: VerifyPhoneOtpDto,
  ): Promise<HttpResponse> {
    await this.authService.verifyPhoneOTP(verifyPhonePayload);
    return new HttpOkResponse(undefined, message.OTPVerified);
  }

  @ApiTags('Auth Apis')
  @Post('register')
  @ApiOkResponse({ description: message.UserRegistered })
  @ApiBadRequestResponse({ description: message.EmailOrPhoneUnverified })
  async register(@Body() registerDto: RegisterDto): Promise<HttpResponse> {
    await this.authService.registerUserInfo(registerDto);
    return new HttpOkResponse(undefined, message.UserRegistered);
  }

  @ApiTags('Auth Apis')
  @Post('login')
  @ApiOkResponse({ description: message.LoggedIn, type: LoginResponseDto })
  @ApiNotFoundResponse({
    description: `${message.Suspended} (or) ${message.InvalidCredential}`,
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpResponse> {
    const data = await this.authService.login(userLoginDto, res);
    return new HttpOkResponse(data, message.LoggedIn);
  }

  @ApiTags('Auth Apis')
  @Post('/refresh')
  @ApiOkResponse({ type: LoginResponseDto, description: message.LoggedIn })
  @ApiUnprocessableEntityResponse({ description: message.InvalidToken })
  @ApiBadRequestResponse({ description: message.TokenNotFound })
  public async refresh(@Req() request: Request): Promise<HttpResponse> {
    try {
      const refreshToken = request.cookies['jwt'];
      if (refreshToken === undefined) {
        throw new BadRequestException(message.TokenNotFound);
      }
      const { user, token } =
        await this.refreshService.createAccessTokenFromRefreshToken(
          refreshToken,
        );
      delete user.password;
      const result = new LoginResponseDto(token, user.roles[0]);
      return new HttpOkResponse(result, message.LoggedIn);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  @ApiTags('Auth Apis')
  @Post('logout')
  @ApiOkResponse({ description: message.LoggedOut })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HttpResponse> {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return new HttpOkResponse(undefined, message.LoggedOut);
  }

  @ApiTags('Forgot Password')
  @Post('send-forgot-password-otp')
  @ApiOkResponse({ description: message.ForgotPassOTP })
  @ApiBadRequestResponse({ description: message.UserNotFound })
  async sendForgotPasswordOTP(
    @Body() sendEmailDto: SendEmailDto,
  ): Promise<HttpResponse> {
    await this.authService.sendForgotPasswordOTP(sendEmailDto);
    return new HttpOkResponse(undefined, message.ForgotPassOTP);
  }

  @ApiTags('Forgot Password')
  @Post('verify-forgot-password-otp')
  @ApiOkResponse({ description: message.OTPVerified })
  @ApiBadRequestResponse({
    description: `${message.OTPNotSent} (or) ${message.InvalidOTP}`,
  })
  async verifyForgotPasswordOTP(
    @Body() verfiyEmailDto: VerifyEmailDto,
  ): Promise<HttpResponse> {
    await this.authService.verifyForgotPasswordOTP(verfiyEmailDto);
    return new HttpOkResponse(undefined, message.OTPVerified);
  }

  @ApiTags('Forgot Password')
  @Post('forgot-password')
  @ApiOkResponse({ description: message.UpdatedPassword })
  @ApiBadRequestResponse({
    description: `${message.OTPNotSent} (or) ${message.InvalidOTP}`,
  })
  async updateForgotPassword(
    @Body() forgotPasswordPayload: ForgotPasswordDto,
  ): Promise<HttpResponse> {
    await this.authService.updatePassword(forgotPasswordPayload);
    return new HttpOkResponse(undefined, message.UpdatedPassword);
  }

  @ApiTags('Auth Apis')
  @Post('verify')
  @ApiOkResponse({ description: message.UserInfo, type: VerifyInfoDto })
  @ApiBadRequestResponse({ description: message.InvalidId })
  async verify(@Body() verfiyDto: VerifyDto): Promise<HttpResponse> {
    const data = await this.authService.fetchVerificationInfo(verfiyDto);
    return new HttpOkResponse(data, message.UserInfo);
  }
}
