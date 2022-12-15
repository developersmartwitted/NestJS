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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { FilterDto } from '../../helpers/dto/FilterDto';
import { User } from '../../helpers/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserDto } from '../user/dto/UserDto';
import { AddTemplateDto } from './dto/payload/AddTemplateDto';
import { DeleteTemplateDto } from './dto/payload/DeleteTemplateDto';
import { UpdateTemplateDto } from './dto/payload/UpdateTemplateDto';
import { TemplateDto } from './dto/TemplateDto';
import { TemplateService } from './template.service';
import { TemplateInfoDto } from './dto/response/TemplateInfoDto';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.AddedTemplate, type: TemplateDto })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async addNewTemplate(
    @Body() templatePayload: AddTemplateDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.templateService.addOrDraftNewTemplate(templatePayload, user);
    return new HttpOkResponse(undefined, message.AddedTemplate);
  }

  @Post('publish')
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.PublishTemplate })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async publishTemplates(
    @Body() template: { templateIds: string[] },
  ): Promise<HttpResponse> {
    await this.templateService.publishTemplates(template);
    return new HttpOkResponse(undefined, message.PublishTemplate);
  }

  @Put()
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.UpdatedTemplate, type: TemplateDto })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async updateTemplate(
    @Body() templatePayload: UpdateTemplateDto,
  ): Promise<HttpResponse> {
    await this.templateService.updateTemplate(templatePayload);
    return new HttpOkResponse(undefined, message.UpdatedTemplate);
  }

  @Get()
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.TemplateList, type: TemplateDto })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async getTemplateList(@Query() filterDto: FilterDto): Promise<HttpResponse> {
    const result = await this.templateService.getTemplateList(filterDto);
    return new HttpOkResponse(result, message.TemplateList);
  }

  @Get(':templateId')
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.TemplateInfo, type: TemplateDto })
  @ApiBadRequestResponse({ description: message.TemplateNotFound })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async getTemplateInfoByTemplateIId(
    @Param('templateId') templateId: string,
  ): Promise<HttpResponse> {
    const result = await this.templateService.getTemplateInfoByTemplateId(
      templateId,
    );
    return new HttpOkResponse(result, message.TemplateInfo);
  }

  @Delete()
  @ApiTags('Template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: message.TemplateDeleted })
  @ApiUnauthorizedResponse({ description: message.UnAuthorized })
  @ApiForbiddenResponse({ description: message.Forbidden })
  async deleteTempalte(
    @Body() payload: DeleteTemplateDto,
  ): Promise<HttpResponse> {
    await this.templateService.deleteTempalte(payload);
    return new HttpOkResponse(undefined, message.TemplateInfo);
  }

  @Get('slug/:slug')
  @ApiTags('Public Routes')
  @ApiOkResponse({
    description: message.TemplateInfo,
    type: TemplateInfoDto,
  })
  @ApiBadRequestResponse({ description: message.TemplateNotFound })
  async getTemplateInfoForSlug(
    @Param('slug') slug: string,
  ): Promise<HttpResponse> {
    const result = await this.templateService.getTemplateInfoForSlug(slug);
    return new HttpOkResponse(result, message.TemplateInfo);
  }
}
