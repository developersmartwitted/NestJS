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
import { AdminSettingsService } from './adminSettings.service';
import { AddPlatformSettingsDto } from './dto/payload/AddPlatformSettingsDto';
import { UpdatePlatformSettingsDto } from './dto/payload/UpdatePlatformSettingsDto';
import { PlatformSettingsDto } from './dto/PlatformSettingsDto';

@ApiTags('Admin Settings')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('admin-settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Post('platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.AddedPlatformSetting })
  async addNewPlatform(
    @User() user: UserDto,
    @Body() platformPayload: AddPlatformSettingsDto,
  ): Promise<HttpResponse> {
    await this.adminSettingsService.addNewPlatformToLimit(
      platformPayload,
      user,
    );
    return new HttpOkResponse(undefined, message.AddedPlatformSetting);
  }

  @Put('platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UpdatePlatform })
  @ApiBadRequestResponse({ description: message.AdminSettingNotFound })
  async UpdatePlatform(
    @Body() platformPayload: UpdatePlatformSettingsDto,
  ): Promise<HttpResponse> {
    await this.adminSettingsService.updatePlatformSetting(platformPayload);
    return new HttpOkResponse(undefined, message.UpdatePlatform);
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiOkResponse({
    description: message.PlatformSetting,
    type: PlatformSettingsDto,
  })
  @ApiBadRequestResponse({ description: message.AdminSettingNotFound })
  async getWeightageForReputation(): Promise<HttpResponse> {
    const result = await this.adminSettingsService.fetchPlatformSettingRecord();
    return new HttpOkResponse(result, message.PlatformSetting);
  }
}
