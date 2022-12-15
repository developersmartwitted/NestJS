import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { User } from '../../helpers/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserDto } from '../user/dto/UserDto';
import { NotificationsDto } from './dto/NotificationsDto';
import { NotificationSettingDto } from './dto/NotificationSettingDto';
import { UpdateNotificationSettings } from './dto/payload/UpdateNotificationSettings';
import { NotificationService } from './notification.service';
import { UpdateNotificationStatus } from './dto/payload/UpdateNotificationStatus';

@ApiTags('Notifications')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.NotificationList,
    type: NotificationsDto,
  })
  async getNotifications(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.notificationService.getNotifications(user);
    return new HttpOkResponse(result, message.NotificationList);
  }

  @Put('/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.NotificationList,
    type: NotificationsDto,
  })
  async updateNotificationAsViewed(
    @User() user: UserDto,
    @Body() notificationPayload: UpdateNotificationStatus,
  ): Promise<HttpResponse> {
    const result = await this.notificationService.updateNotificationAsViewed(
      user,
      notificationPayload,
    );
    return new HttpOkResponse(result, message.NotificationList);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.AddNotifySetting })
  @ApiBadRequestResponse({ description: message.PresentNotifySetting })
  async addNotificationSettings(@User() user: UserDto): Promise<HttpResponse> {
    await this.notificationService.createNotificationSettings(user);
    return new HttpOkResponse(undefined, message.AddNotifySetting);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.NotificationList,
    type: NotificationSettingDto,
  })
  async getNotificationSettings(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.notificationService.getNotificationSettings(user);
    return new HttpOkResponse(result, message.NotificationList);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.UpdateNotifySetting })
  @ApiBadRequestResponse({ description: message.NotifySettingNotFound })
  async updateNotificationSettings(
    @Body() updatePayload: UpdateNotificationSettings,
  ): Promise<HttpResponse> {
    await this.notificationService.updateNotificationSettings(updatePayload);
    return new HttpOkResponse(undefined, message.AddNotifySetting);
  }
}
