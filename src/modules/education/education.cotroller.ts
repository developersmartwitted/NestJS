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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { User } from '../../helpers/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { UserDto } from '../user/dto/UserDto';
import { CertificationDto } from './dto/CertificationDto';
import { EducationDto } from './dto/EducationDto';
import { AddCertificateDto } from './dto/payload/AddCertificateDto';
import { AddEducationDto } from './dto/payload/AddEducationDto';
import { DeleteCertificateDto } from './dto/payload/DeleteCertificateDto';
import { DeleteEducationDto } from './dto/payload/DeleteEducationDto';
import { UpdateCertificateDto } from './dto/payload/UpdateCertificateDto';
import { UpdateEducationDto } from './dto/payload/UpdateEducationDto';
import { EducationService } from './education.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiBearerAuth()
@Controller()
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @ApiTags('Education')
  @Post('education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EducationAdded })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async addNewEducation(
    @Body() educationPayloadDto: AddEducationDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.addNewEducation(educationPayloadDto, user);
    return new HttpOkResponse(undefined, message.EducationAdded);
  }

  @ApiTags('Education')
  @Put('education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EducationUpdated })
  @ApiBadRequestResponse({ description: message.EducationNotFound })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async updateEducation(
    @Body() educationPayload: UpdateEducationDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.updateEducationDetail(user, educationPayload);
    return new HttpOkResponse(undefined, message.EducationUpdated);
  }

  @ApiTags('Education')
  @Delete('education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EducationDeleted })
  @ApiBadRequestResponse({ description: message.EducationNotFound })
  async deleteEducationDetail(
    @Body() educationPayloadDto: DeleteEducationDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.deleteEducationInfo(user, educationPayloadDto);
    return new HttpOkResponse(undefined, message.EducationDeleted);
  }

  @ApiTags('Education')
  @Get('education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EducationInfo, type: EducationDto })
  async getEducation(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.educationService.getEducationInfo(user);
    return new HttpOkResponse(result, message.EducationInfo);
  }

  @ApiTags('Education')
  @Get('education/:educationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.EducationInfo, type: EducationDto })
  @ApiBadRequestResponse({ description: message.EducationNotFound })
  async getEducationById(
    @User() user: UserDto,
    @Param('educationId') educationId: string,
  ): Promise<HttpResponse> {
    const result = await this.educationService.getEducationById(
      user,
      educationId,
    );
    return new HttpOkResponse(result, message.EducationInfo);
  }

  @ApiTags('Certification')
  @Post('certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.CertificateAdded })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async addNewCertification(
    @Body() certificatePayload: AddCertificateDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.addNewCertification(certificatePayload, user);
    return new HttpOkResponse(undefined, message.CertificateAdded);
  }

  @ApiTags('Certification')
  @Put('certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.CertificateUpdated })
  @ApiBadRequestResponse({ description: message.CertificateNotFound })
  @ApiInternalServerErrorResponse({ description: message.InternalServer })
  async updateCertificate(
    @Body() certificatePayload: UpdateCertificateDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.updateCertificateDetail(
      user,
      certificatePayload,
    );
    return new HttpOkResponse(undefined, message.CertificateUpdated);
  }

  @ApiTags('Certification')
  @Delete('certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.CertificateDeleted })
  @ApiBadRequestResponse({ description: message.CertificateNotFound })
  async deleteCertificateDetail(
    @Body() deletePayloadDto: DeleteCertificateDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.educationService.deleteCertificationInfo(user, deletePayloadDto);
    return new HttpOkResponse(undefined, message.CertificateDeleted);
  }

  @ApiTags('Certification')
  @Get('certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.CertificateInfo,
    type: CertificationDto,
  })
  async getCertificates(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.educationService.getCertificateInfo(user);
    return new HttpOkResponse(result, message.CertificateInfo);
  }

  @ApiTags('Certification')
  @Get('certificate/:certificateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.CertificateInfo,
    type: CertificationDto,
  })
  @ApiBadRequestResponse({ description: message.CertificateNotFound })
  async getCertificateById(
    @User() user: UserDto,
    @Param('certificateId') certificateId: string,
  ): Promise<HttpResponse> {
    const result = await this.educationService.getCertificateById(
      user,
      certificateId,
    );
    return new HttpOkResponse(result, message.CertificateInfo);
  }
}
