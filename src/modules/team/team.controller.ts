import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

import { FilterDto } from '../../helpers/dto/FilterDto';
import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AddTeamDto } from './dto/payload/AddTeamDto';
import { TeamListDto } from './dto/response/TeamListDto';
import { TeamService } from './team.service';
import { UpdateTeamDto } from './dto/payload/UpdateTeamDto';
import { UserDto } from '../user/dto/UserDto';
import { UserEntity } from '../user/entities/user.entity';
import { DeleteTeamMemberDto } from './dto/payload/DeleteTeamMemberDto';
import { SendTeamInviteDto } from './dto/payload/SendTeamInviteDto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Teams')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamAdded })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async createNewTeam(
    @User() user: UserEntity,
    @Body() addTeamDto: AddTeamDto,
  ): Promise<HttpResponse> {
    await this.teamService.createNewTeam(addTeamDto, user);
    return new HttpOkResponse(undefined, message.TeamAdded);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamUpdated })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async updateTeam(
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<HttpResponse> {
    await this.teamService.updateTeamInfo(updateTeamDto);
    return new HttpOkResponse(undefined, message.TeamUpdated);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamInfo, type: TeamListDto })
  async getTeamListForUser(
    @User() user: UserDto,
    @Query() filterDto: FilterDto,
  ): Promise<HttpResponse> {
    const result = await this.teamService.getTeamsCreatedByUser(
      user.id,
      filterDto,
    );
    return new HttpOkResponse(result, message.TeamInfo);
  }

  @Get(':teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamInfo, type: TeamListDto })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async getTeamInfo(
    @User() user: UserDto,
    @Param('teamId') teamId: string,
  ): Promise<HttpResponse> {
    const result = await this.teamService.getTeamsByTeamId(user.id, teamId);
    return new HttpOkResponse(result, message.TeamInfo);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamDeleted })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async deleteTeam(@Body() team: { teamId: string }): Promise<HttpResponse> {
    await this.teamService.deleteTeam(team.teamId);
    return new HttpOkResponse(undefined, message.TeamInfo);
  }

  @Delete('member')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.MemberDeleted })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async deleteTeamMember(
    @Body() team: DeleteTeamMemberDto,
  ): Promise<HttpResponse> {
    await this.teamService.deleteTeamMember(team);
    return new HttpOkResponse(undefined, message.MemberDeleted);
  }

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamInvite })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async sendInvitationToExtenamUser(
    @User() user: UserEntity,
    @Body() invitePayload: SendTeamInviteDto,
  ): Promise<HttpResponse> {
    await this.teamService.sendInvitationToUser(invitePayload, user);
    return new HttpOkResponse(undefined, message.TeamInvite);
  }

  @Post('accept-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.TeamInviteAccept })
  @ApiBadRequestResponse({ description: message.TeamNotFound })
  async acceptInvite(
    @Body() teamInviteDto: { id: string },
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.teamService.acceptTeamInvite(teamInviteDto, user);
    return new HttpOkResponse(undefined, message.TeamInviteAccept);
  }
}
