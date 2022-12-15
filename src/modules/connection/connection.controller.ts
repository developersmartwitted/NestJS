import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserEntity } from '../user/entities/user.entity';
import { ConnectionService } from './connection.service';
import { RevokeConnectionDto } from './dto/payload/RevokeConnectionDto';
import { SendConnectionInviteDto } from './dto/payload/SendConnectionInviteDto';
import { ConnectionListDto } from './dto/response/ConnectionListDto';

@Controller('connection')
@ApiTags('Connections')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SentConnection })
  @ApiBadRequestResponse({ description: message.AlreadyRegistered })
  async sendConnectionInvite(
    @User() user: UserEntity,
    @Body() inviteConnection: SendConnectionInviteDto,
  ): Promise<HttpResponse> {
    await this.connectionService.sendConnectionInvite(inviteConnection, user);
    return new HttpOkResponse(undefined, message.SentConnection);
  }

  @Post('accept-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.AcceptConnection })
  @ApiBadRequestResponse({ description: message.AlreadyRegistered })
  async acceptConnectionInvite(
    @User() user: UserEntity,
    @Body() inviteConnection: { id: string },
  ): Promise<HttpResponse> {
    await this.connectionService.acceptConnectionInvite(inviteConnection, user);
    return new HttpOkResponse(undefined, message.AcceptConnection);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.ConnectionInfo,
    type: ConnectionListDto,
  })
  async getUserConnection(@User() user: UserEntity): Promise<HttpResponse> {
    const result = await this.connectionService.getConnections(user);
    return new HttpOkResponse(result, message.ConnectionInfo);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ConnectionRevoked })
  @ApiNotFoundResponse({ description: message.InvalidConnection })
  async revokeConnection(
    @User() user: UserEntity,
    @Body() payload: RevokeConnectionDto,
  ): Promise<HttpResponse> {
    const result = await this.connectionService.revokeConnection(user, payload);
    return new HttpOkResponse(result, message.ConnectionInfo);
  }
}
