import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { User } from '../../helpers/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ReputationConstantService } from './reputationConstant.service';
import { UserDto } from '../user/dto/UserDto';
import { AddReputationWeightDto } from './dto/payload/AddReputationWeightDto';
import { ReputationWeightDto } from './dto/ReputationWeightDto';
import { UpdateReputationWeightDto } from './dto/payload/UpdateReputationWeightDto';
import { AddQuestionDto } from './dto/payload/AddQuestionDto';
import { AddAnswerDto } from './dto/payload/AddAnswerDto';

@ApiTags('Reputation Constants')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('reputation-constant')
export class ReputationConstantController {
  constructor(
    private readonly reputationConstantService: ReputationConstantService,
  ) {}

  @Post('weightage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.AddWeightage })
  @ApiUnprocessableEntityResponse({ description: message.WeightageConstrain })
  async addWeightageForReputation(
    @Body() reputationWeights: AddReputationWeightDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.reputationConstantService.addReputationWeightage(
      reputationWeights,
      user,
    );
    return new HttpOkResponse(undefined, message.AddWeightage);
  }

  @Put('weightage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UpdatedWeightage })
  @ApiUnprocessableEntityResponse({ description: message.WeightageConstrain })
  async updateWeightageForReputation(
    @Body() reputationWeights: UpdateReputationWeightDto,
  ): Promise<HttpResponse> {
    await this.reputationConstantService.updateReputationWeightage(
      reputationWeights,
    );
    return new HttpOkResponse(undefined, message.UpdatedWeightage);
  }

  @Get('weightage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: message.WeightageInfo,
    type: ReputationWeightDto,
  })
  @ApiBadRequestResponse({ description: message.WeightageNotFound })
  async getWeightageForReputation(): Promise<HttpResponse> {
    const result =
      await this.reputationConstantService.fetchReputationWeightage();
    return new HttpOkResponse(result, message.WeightageInfo);
  }

  @Post('question')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.QuestionCreated })
  async CreateQuestion(
    @Body() questionPayload: AddQuestionDto,
  ): Promise<HttpResponse> {
    await this.reputationConstantService.addQuestion(questionPayload);
    return new HttpOkResponse(undefined, message.UpdatedWeightage);
  }

  @Post('answer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.AnswerCreated })
  async CreateAnswer(
    @Body() answerPayload: AddAnswerDto,
  ): Promise<HttpResponse> {
    await this.reputationConstantService.addAnswer(answerPayload);
    return new HttpOkResponse(undefined, message.UpdatedWeightage);
  }
}
