import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import moment from 'moment';
import { ILike, In } from 'typeorm';

import { TemplateNotFound } from '../../shared/http/message.http';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { UserDto } from '../user/dto/UserDto';
import { AddTemplateDto } from './dto/payload/AddTemplateDto';
import { DeleteTemplateDto } from './dto/payload/DeleteTemplateDto';
import { UpdateTemplateDto } from './dto/payload/UpdateTemplateDto';
import { TemplateListDto } from './dto/response/TemplateListDto';
import { TemplateDto } from './dto/TemplateDto';
import { TemplateRepository } from './repositories/template.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import * as message from '../../shared/http/message.http';
import { TemplateInfoDto } from './dto/response/TemplateInfoDto';

@Injectable()
export class TemplateService {
  constructor(
    public readonly templateRepository: TemplateRepository,
    private logger: LoggerService,
  ) {}

  /**
   * @description Saves new template as a draft or publish record in DB
   * @param templatePayload AddTemplateDto {publishedTitle, publishedDescription, draftedTitle, draftedDescription}
   * @param user Logged in user info
   * @returns Saved template info {TemplateDto} data
   * @author Samsheer Alam
   */
  async addOrDraftNewTemplate(
    templatePayload: AddTemplateDto,
    user: UserDto,
  ): Promise<TemplateDto> {
    try {
      const template = {
        createdBy: user,
        draftedTitle: templatePayload?.draftedTitle || null,
        draftedDescription: templatePayload?.draftedDescription || null,
        publishedTitle: templatePayload?.publishedTitle || null,
        publishedDescription: templatePayload?.publishedDescription || null,
        lastDraftedAt:
          templatePayload?.draftedTitle === undefined ||
          templatePayload?.draftedTitle === ''
            ? null
            : new Date(moment().format()),
        lastPublisedAt:
          templatePayload?.publishedTitle === undefined ||
          templatePayload?.publishedTitle === ''
            ? null
            : new Date(moment().format()),
      };
      const templateRef = this.templateRepository.create(template);
      return await this.templateRepository.save(templateRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Update template and save as a draft or publish the template.
   * If this needs to be published, then draftedTitle and draftedDescription needs to be empty
   * If this needs to be drafted, then all four needs to have some value
   * @param templatePayload UpdateTemplateDto {templateId, publishedTitle, publishedDescription, draftedTitle, draftedDescription}
   * @author Samsheer Alam
   */
  async updateTemplate(
    templatePayload: UpdateTemplateDto,
  ): Promise<TemplateDto> {
    try {
      const templateInfo = await this.templateRepository.findOne({
        id: templatePayload.templateId,
      });
      templateInfo.draftedTitle = templatePayload?.draftedTitle || null;
      templateInfo.draftedDescription =
        templatePayload?.draftedDescription || null;
      templateInfo.publishedTitle = templatePayload?.publishedTitle || null;
      templateInfo.publishedDescription =
        templatePayload?.publishedDescription || null;

      return await this.templateRepository.save(templateInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches all the active templates
   * @param filterDto - Search value
   * @returns TemplateListDto data
   * @author Samsheer Alam
   */
  async getTemplateList(filterDto: FilterDto): Promise<TemplateListDto[]> {
    try {
      const { search } = filterDto;
      let where = {};
      if (search !== undefined) {
        where = { status: true, publishedTitle: ILike(`%${search}%`) };
      } else {
        where = { status: true };
      }
      const templates = await this.templateRepository.find(where);
      return templates.map((item: any) => {
        return {
          id: item.id,
          publishedTitle: item.publishedTitle,
          publishedDescription: item.publishedDescription,
          lastPublisedAt:
            item.lastPublisedAt === null
              ? item.lastPublisedAt
              : moment(item.lastPublisedAt).format('DD/MM/YYYY'),
          draftedTitle: item.draftedTitle,
          draftedDescription: item.draftedDescription,
          lastDraftedAt:
            item.lastDraftedAt === null
              ? item.lastDraftedAt
              : moment(item.lastDraftedAt).format('DD/MM/YYYY'),
          status: item.status,
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the info of template for given tempalte id
   * @param templateId {template id}
   * @returns Template info
   * @author Samsheer Alam
   */
  async getTemplateInfoByTemplateId(templateId: string): Promise<TemplateDto> {
    try {
      const templateInfo = await this.templateRepository.findOne({
        id: templateId,
        status: true,
      });
      if (templateInfo === undefined) {
        throw new BadRequestException(TemplateNotFound);
      }
      return templateInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Deletes the template for given template id
   * @param payload Array of {template Ids}
   * @returns delete template info
   * @author Samsheer Alam
   */
  async deleteTempalte(payload: DeleteTemplateDto): Promise<void> {
    try {
      payload.templateIds.map(async (item) => {
        const templateInfo = await this.templateRepository.findOne({
          id: item,
          status: true,
        });
        if (templateInfo !== undefined) {
          templateInfo.status = false;
          this.templateRepository.save(templateInfo);
        }
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Publishes the multiple templates at once
   * if drat is present, then draft is moved as published
   * @param template Array of template ids
   * @author Samsheer Alam
   */
  async publishTemplates(template: { templateIds: string[] }): Promise<void> {
    try {
      const templates = await this.templateRepository.find({
        where: {
          status: true,
          id: In(template.templateIds),
        },
      });

      templates.map((item) => {
        if (item.draftedTitle !== null) {
          item.publishedTitle = item.draftedTitle;
          item.publishedDescription = item.draftedDescription;
          item.lastPublisedAt = new Date(moment().format());
          item.draftedTitle = null;
          item.draftedDescription = null;
          item.lastDraftedAt = null;
          this.templateRepository.save(item);
        }
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetchs the template info for the given slug
   * @param slug For which template info needs to be fetched
   * @returns {TemplateInfoDto} data { title: string, description: string}
   * @author Samsheer Alam
   */
  async getTemplateInfoForSlug(slug: string): Promise<TemplateInfoDto> {
    try {
      const templateInfo = await this.templateRepository.findOne({
        slug,
        status: true,
      });
      if (templateInfo === undefined) {
        throw new BadRequestException(message.TemplateNotFound);
      }
      return {
        title: templateInfo?.publishedTitle,
        description: templateInfo?.publishedDescription,
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
