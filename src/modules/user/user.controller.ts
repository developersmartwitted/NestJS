import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { User } from '../../helpers/decorators/user.decorator';
import { S3Service } from '../../shared/providers/s3.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UploadS3Dto } from './dto/payload/UploadS3Dto';
import { S3UploadDto } from './dto/response/S3UploadDto';
import { UserDto } from './dto/UserDto';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UpdateProfileDto } from './dto/payload/UpdatePofileDto';
import { ChangePasswordDto } from './dto/payload/ChangePasswordDto';
import { UserListDto } from '../admin/dto/response/UserListDto';

@Controller('user')
export class UserController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
  ) {}

  @Get('s3-upload-url')
  @ApiTags('Public Routes')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: S3UploadDto, description: message.S3Url })
  async getS3Url(@Query() uploadDto: UploadS3Dto): Promise<HttpResponse> {
    const s3UploadUrl = await this.s3Service.generateUploadUrl(uploadDto);
    return new HttpOkResponse({ s3UploadUrl }, message.S3Url);
  }

  @ApiBearerAuth()
  @ApiTags('User')
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProfileInfo, type: UserListDto })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async getUserInfo(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.userService.getUserProfileInfo(user);
    return new HttpOkResponse(result, message.ProfileInfo);
  }

  @ApiBearerAuth()
  @ApiTags('User')
  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: message.UpdatedProfile })
  @ApiBadRequestResponse({ description: message.EmailOrPhoneUnverified })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async updateProfileInfo(
    @Body() payload: UpdateProfileDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.userService.updateProfileInfo(payload, user);
    return new HttpOkResponse(undefined, message.UpdatedProfile);
  }

  @ApiBearerAuth()
  @ApiTags('User')
  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.UpdatedPassword })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async changePassword(
    @User() user: UserDto,
    @Body() payload: ChangePasswordDto,
  ): Promise<HttpResponse> {
    await this.userService.changeUserPassword(user, payload);
    return new HttpOkResponse(undefined, message.UpdatedPassword);
  }
}
