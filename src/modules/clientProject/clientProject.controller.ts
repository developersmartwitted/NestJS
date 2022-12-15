import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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

import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

import { UserDto } from '../user/dto/UserDto';
import { ClientProjectService } from './clientProject.service';
import { ClientProjectDto } from './dto/ClientProjectDto';
import { AddClientProjectDto } from './dto/payload/AddClientProjectDto';
import { DeleteClientProjectDto } from './dto/payload/DeleteClientProjectDto';
import { SendClientProjectInviteDto } from './dto/payload/SendClientProjectInviteDto';
import { UpdateClientProjectDto } from './dto/payload/UpdateClientProjectDto';
import { VerifyClientProjectDto } from './dto/payload/VerifyClientProjectDto';

@ApiTags('Client Project APIs')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('client-project')
export class ClientProjectController {
  constructor(private readonly clientProjectService: ClientProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectAdded })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async addNewClientProject(
    @User() user: UserDto,
    @Body() payload: AddClientProjectDto,
  ): Promise<HttpResponse> {
    await this.clientProjectService.addClientProject(payload, user);
    return new HttpOkResponse(undefined, message.ClientProjectAdded);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectUpdated })
  @ApiNotFoundResponse({ description: message.ClientProjectNotFound })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async updateEmployment(
    @User() user: UserDto,
    @Body() payload: UpdateClientProjectDto,
  ): Promise<HttpResponse> {
    await this.clientProjectService.updateEmploymentData(payload, user);
    return new HttpOkResponse(undefined, message.ClientProjectUpdated);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.ClientProjectInfo,
    type: ClientProjectDto,
  })
  async getAllClientProjects(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.clientProjectService.getAllClientProjctData(user);
    return new HttpOkResponse(result, message.ClientProjectInfo);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectDelete })
  @ApiBadRequestResponse({ description: message.ClientProjectNotFound })
  async deleteEmploymentRecord(
    @User() user: UserDto,
    @Body() payload: DeleteClientProjectDto,
  ): Promise<HttpResponse> {
    await this.clientProjectService.deleteClientProjectData(user, payload);
    return new HttpOkResponse(undefined, message.ClientProjectDelete);
  }

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectInvite })
  @ApiBadRequestResponse({ description: message.InviteAlreadySent })
  async sendClientProjectInvite(
    @User() user: UserDto,
    @Body() payload: SendClientProjectInviteDto,
  ): Promise<HttpResponse> {
    await this.clientProjectService.sendClientProjectInvite(user, payload);
    return new HttpOkResponse(undefined, message.ClientProjectInvite);
  }

  @Get(':clientProjectId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectQues })
  async getProjectQuestion(
    @Param('clientProjectId') clientProjectId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result =
      await this.clientProjectService.getProjectVerificationQuestion(
        clientProjectId,
        user,
      );
    return new HttpOkResponse(result, message.ClientProjectQues);
  }

  @Get(':clientProjectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ClientProjectInfo })
  @ApiBadRequestResponse({ description: message.ClientProjectNotFound })
  async getClientProjectById(
    @Param('clientProjectId') employmentId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.clientProjectService.getClientProjectDataById(
      employmentId,
      user,
    );
    return new HttpOkResponse(result, message.ClientProjectInfo);
  }

  @Post('verify-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.Verified })
  @ApiBadRequestResponse({ description: message.InviteAlreadySent })
  async verifyClientProjectInvite(
    @User() user: UserDto,
    @Body() answerPayload: VerifyClientProjectDto,
  ): Promise<HttpResponse> {
    await this.clientProjectService.verifyClientProjectInvite(
      user,
      answerPayload,
    );
    return new HttpOkResponse(undefined, message.Verified);
  }
}
