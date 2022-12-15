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
import { EmploymentDto } from './dto/EmploymentDto';
import { AddEmploymentDto } from './dto/payload/AddEmploymentDto';
import { DeleteEmploymentDto } from './dto/payload/DeleteEmploymentDto';
import { SendEmploymentInvite } from './dto/payload/SendEmploymentInviteDto';
import { UpdateEmploymentDto } from './dto/payload/UpdateEmploymentDto';
import { EmploymentService } from './employment.service';
import { VerifyEmploymentDto } from './dto/payload/VerifyEmploymentDto';

@ApiTags('Employment')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('employment')
export class EmploymentController {
  constructor(private readonly employmentService: EmploymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentAdded })
  async createNewEmployment(
    @User() user: UserDto,
    @Body() emmploymentPayload: AddEmploymentDto,
  ): Promise<HttpResponse> {
    await this.employmentService.addEmployment(emmploymentPayload, user);
    return new HttpOkResponse(undefined, message.EmploymentAdded);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentUpdated })
  @ApiBadRequestResponse({ description: message.EmploymentNotFound })
  async updateEmployment(
    @User() user: UserDto,
    @Body() emmploymentPayload: UpdateEmploymentDto,
  ): Promise<HttpResponse> {
    await this.employmentService.updateEmploymentData(emmploymentPayload, user);
    return new HttpOkResponse(undefined, message.EmploymentUpdated);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentInfo, type: EmploymentDto })
  async getAllEmployment(@User() user: UserDto): Promise<HttpResponse> {
    const employments = await this.employmentService.getAllEmploymentData(user);
    return new HttpOkResponse(employments, message.EmploymentInfo);
  }

  @Get(':employmentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentInfo, type: EmploymentDto })
  @ApiBadRequestResponse({ description: message.EmploymentNotFound })
  async getEmploymentbyId(
    @Param('employmentId') employmentId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const employment = await this.employmentService.getEmploymentDataById(
      employmentId,
      user,
    );
    return new HttpOkResponse(employment, message.EmploymentInfo);
  }

  @Get(':verificationId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentQues })
  @ApiBadRequestResponse({ description: message.EmploymentNotFound })
  async getProjectQuestion(
    @Param('verificationId') verificationId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const questions =
      await this.employmentService.getEmploymmentVerificationQuestion(
        verificationId,
        user,
      );
    return new HttpOkResponse(questions, message.EmploymentQues);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentDelete })
  @ApiBadRequestResponse({ description: message.EmploymentNotFound })
  async deleteEmploymentRecord(
    @User() user: UserDto,
    @Body() deletePayload: DeleteEmploymentDto,
  ): Promise<HttpResponse> {
    await this.employmentService.deleteEmploymentData(user, deletePayload);
    return new HttpOkResponse(undefined, message.EmploymentDelete);
  }

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EmploymentInvite })
  @ApiBadRequestResponse({ description: message.EmploymentNotFound })
  async sendEmploymentInvite(
    @User() user: UserDto,
    @Body() invitePayload: SendEmploymentInvite,
  ): Promise<HttpResponse> {
    await this.employmentService.sendEmploymentInvite(user, invitePayload);
    return new HttpOkResponse(undefined, message.EmploymentInvite);
  }

  @Post('verify-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.Verified })
  @ApiBadRequestResponse({ description: message.EducationNotFound })
  async verifyQuestionsAnswer(
    @Body() verifyPayload: VerifyEmploymentDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.employmentService.verifyQuestionsAnswer(verifyPayload, user);
    return new HttpOkResponse(undefined, message.Verified);
  }
}
