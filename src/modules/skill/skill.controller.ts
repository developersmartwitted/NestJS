import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';
import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { AddSkillDto } from './dto/payload/AddSkillDto';
import { SkillDto } from './dto/SkillDto';
import { SkillService } from './skill.service';
import { UserDto } from '../user/dto/UserDto';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { AddUserSkillDto } from './dto/payload/AddUserSkillDto';
import { UserSkillDto } from './dto/response/UserSkillDto';
import { SkillInviteDto } from './dto/payload/SkillInviteDto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { VerifySkillDto } from './dto/payload/VerifySkillDto';

@ApiTags('Skills')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller()
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post('skill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillAdded })
  @ApiConflictResponse({ description: message.SkillAlreadyPresent })
  async addSkills(
    @Body() skillsPayloadDto: AddSkillDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.skillService.addSkills(skillsPayloadDto, user.id);
    return new HttpOkResponse(undefined, message.SkillAdded);
  }

  @Get('skill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillInfo, type: SkillDto })
  async getSkills(@Query() filterDto: FilterDto): Promise<HttpResponse> {
    const result = await this.skillService.getSkills(filterDto);
    return new HttpOkResponse(result, message.SkillInfo);
  }

  @Post('user/skill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillAdded })
  @ApiConflictResponse({ description: message.SkillAlreadyPresent })
  async addUserSkill(
    @Body() payloadDto: AddUserSkillDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.skillService.addUserSkill(payloadDto, user);
    return new HttpOkResponse(undefined, message.SkillAdded);
  }

  @Get('user/skill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillInfo, type: UserSkillDto })
  async getUserSkills(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.skillService.getUserSkills(user);
    return new HttpOkResponse(result, message.SkillInfo);
  }

  @Post('user/skill/send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillInvite })
  @ApiConflictResponse({ description: message.SkillNotFound })
  async sendVerificationInvite(
    @Body() sendInvitePayload: SkillInviteDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.skillService.sendVerificationEmail(user, sendInvitePayload);
    return new HttpOkResponse(undefined, message.SkillInvite);
  }

  @Get('skill/:verifictaionId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.SkillQuestion, type: UserSkillDto })
  @ApiBadRequestResponse({ description: message.SkillNotFound })
  async getSkillsQuestion(
    @Param('verifictaionId') verifictaionId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.skillService.getSkillVerificationQuestion(
      verifictaionId,
      user,
    );
    return new HttpOkResponse(result, message.SkillQuestion);
  }

  @Post('skill/verify-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.Verified })
  @ApiBadRequestResponse({ description: message.SkillNotFound })
  async verifyQuestionsAnswer(
    @Body() verifyPayload: VerifySkillDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.skillService.verifyQuestionsAnswer(user, verifyPayload);
    return new HttpOkResponse(undefined, message.Verified);
  }
}
