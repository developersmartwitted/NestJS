import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';
import { User } from '../../helpers/decorators/user.decorator';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserDto } from '../user/dto/UserDto';
import { AdminService } from './admin.service';
import { ActivateOrDeactivateDto } from './dto/payload/ActivateOrDeactivateDto';
import { ExportFilterDto } from './dto/payload/ExportFilterDto';
import { UserListDto } from './dto/response/UserListDto';
import { DashboardDto } from './dto/response/DashboardDto';

@ApiTags('Admin')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.ProfileInfo, type: UserListDto })
  async getAdminProfileInfo(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.adminService.getAdminProfile(user);
    return new HttpOkResponse(result, message.ProfileInfo);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UserList, type: UserListDto })
  async getUserList(@Query() filterDto: FilterDto): Promise<HttpResponse> {
    const result = await this.adminService.getAllActiveUserList(filterDto);
    return new HttpOkResponse(result, message.UserList);
  }

  @Get('users/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UserList, type: UserListDto })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async exportUserInfo(
    @Query() exportFilterDto: ExportFilterDto,
  ): Promise<HttpResponse> {
    const result = await this.adminService.exportUserInfo(exportFilterDto);
    return new HttpOkResponse(result, message.UserList);
  }

  @Get('users/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UserInfo, type: UserListDto })
  @ApiNotFoundResponse({ description: message.UserNotFound })
  async getUserInfo(@Param('userId') userId: string): Promise<HttpResponse> {
    const result = await this.adminService.getUserDetail(userId);
    return new HttpOkResponse(result, message.UserInfo);
  }

  @Put('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UserStatus })
  @ApiNotFoundResponse({ description: message.UserNotFound })
  async activateOrDeactivateUser(
    @Body() payload: ActivateOrDeactivateDto,
  ): Promise<HttpResponse> {
    const result = await this.adminService.deactivateOrActivateUser(payload);
    return new HttpOkResponse(result, message.UserInfo);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.DashboardInfo, type: DashboardDto })
  async getDashboardData(): Promise<HttpResponse> {
    const result = await this.adminService.getDashboardInfo();
    return new HttpOkResponse(result, message.UserInfo);
  }
}
