import {
  BadRequestException,
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

import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserEntity } from '../user/entities/user.entity';
import { AddProjectDto } from './dto/payload/AddProjectDto';
import { ApplyProjectDto } from './dto/payload/ApplyProjectDto';
import { MyProjectDto } from './dto/payload/MyProjectDto';
import { ProjectDto } from './dto/ProjectDto';
import { MyProjectListDto } from './dto/response/MyProjectListDto';
import { ProjectService } from './project.service';
import { ProjectMemberDto } from './dto/response/ProjectMemberDto';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { AcceptProjectDto } from './dto/payload/AcceptProjectDto';
import { UpdateProjectStatusDto } from './dto/payload/UpdateProjectStatusDto';
import { UpdateProjectDto } from './dto/payload/UpdateProjectDto';
import { SendProjectInviteDto } from './dto/payload/SendProjectInviteDto';
import { RemoveProjectMemberDto } from './dto/payload/RemoveProjectMemberDto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { UserDto } from '../user/dto/UserDto';
import { ProjectBy } from './enums/projectBy.enum';

@ApiTags('Projects')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@Controller('projects')
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectCreated })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async addNewProject(
    @Body() projectPayloadDto: AddProjectDto,
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.projectService.createProject(projectPayloadDto, user);
    return new HttpOkResponse(undefined, message.ProjectCreated);
  }

  @Get('explore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectInfo, type: MyProjectListDto })
  async getProjectBySearch(
    @Query() filterDto: FilterDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.projectService.getProjectList(filterDto, user);
    return new HttpOkResponse(result, message.ProjectInfo);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectUpdated })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async updateProject(
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<HttpResponse> {
    await this.projectService.updateProject(updateProjectDto);
    return new HttpOkResponse(undefined, message.ProjectUpdated);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectDeleted })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async deleteProjects(
    @Body() project: { projectId: string },
  ): Promise<HttpResponse> {
    await this.projectService.deleteProject(project.projectId);
    return new HttpOkResponse(undefined, message.ProjectDeleted);
  }

  @Get('my-projects')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectInfo, type: ProjectDto })
  @ApiBadRequestResponse({ description: message.ProjectInvalidStatus })
  async getMyProject(
    @Query() queryParam: MyProjectDto,
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    let result = undefined;
    if (queryParam.createdBy === ProjectBy.ME) {
      result = await this.projectService.getMyProjectData(queryParam, user);
    } else if (queryParam.createdBy === ProjectBy.ELSE) {
      result = await this.projectService.getElseProjectData(queryParam, user);
    } else {
      throw new BadRequestException(message.ProjectInvalidStatus);
    }
    return new HttpOkResponse(result, message.ProjectInfo);
  }

  @Get(':projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectInfo, type: ProjectDto })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async getProjectInfoById(
    @Param('projectId') projectId: string,
  ): Promise<HttpResponse> {
    const result = await this.projectService.getProjectInfoById(projectId);
    return new HttpOkResponse(result, message.ProjectInfo);
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectMember, type: ProjectMemberDto })
  async getProjectMembersList(
    @Param('projectId') projectId: string,
    @Query() filterDto: FilterDto,
  ): Promise<HttpResponse> {
    const result = await this.projectService.getProjectMembersList(
      projectId,
      filterDto,
    );
    return new HttpOkResponse(result, message.ProjectInfo);
  }

  @Delete('members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.MemberDeleted })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async removeProjectMember(
    @Body() project: RemoveProjectMemberDto,
  ): Promise<HttpResponse> {
    await this.projectService.removeProjectMember(project);
    return new HttpOkResponse(undefined, message.MemberDeleted);
  }

  @Get(':projectId/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.ProjectApplicantList,
    type: ProjectMemberDto,
  })
  async getApplicantsList(
    @Param('projectId') projectId: string,
    @Query() filterDto: FilterDto,
  ): Promise<HttpResponse> {
    const result = await this.projectService.getProjectApplicantList(
      projectId,
      filterDto,
    );
    return new HttpOkResponse(result, message.ProjectApplicantList);
  }

  @Put('apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectApplied })
  @ApiBadRequestResponse({ description: message.ProjectAlreadyApplied })
  async applyForProject(
    @User() user: UserEntity,
    @Body() applyProjectDto: ApplyProjectDto,
  ): Promise<HttpResponse> {
    await this.projectService.applyForProject(user, applyProjectDto);
    return new HttpOkResponse(undefined, message.ProjectApplied);
  }

  @Put('accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectAccepted })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async addUserToProject(
    @Body() payload: AcceptProjectDto,
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.projectService.acceptProjectApplication(payload, user);
    return new HttpOkResponse(undefined, message.ProjectAccepted);
  }

  @Put('update-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectStatus })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async updateProjectStatus(
    @Body() payload: UpdateProjectStatusDto,
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.projectService.updateProjectStatus(payload, user);
    return new HttpOkResponse(undefined, message.ProjectStatus);
  }

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectInvite })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async sendProjectInvite(
    @Body() projectInviteDto: SendProjectInviteDto,
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.projectService.sendProjectInvite(projectInviteDto, user);
    return new HttpOkResponse(undefined, message.ProjectInvite);
  }

  @Post('accept-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ProjectAccepted })
  @ApiBadRequestResponse({ description: message.ProjectNotFound })
  async acceptInvite(
    @Body() projectInviteDto: { id: string },
    @User() user: UserEntity,
  ): Promise<HttpResponse> {
    await this.projectService.acceptProjectInvite(projectInviteDto, user);
    return new HttpOkResponse(undefined, message.ProjectAccepted);
  }
}
