import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AdminSettingNotFound } from '../../shared/http/message.http';
import { UserDto } from '../user/dto/UserDto';
import { AddPlatformSettingsDto } from './dto/payload/AddPlatformSettingsDto';
import { UpdatePlatformSettingsDto } from './dto/payload/UpdatePlatformSettingsDto';
import { PlatformSettingsDto } from './dto/PlatformSettingsDto';
import { PlatformSettingsRepository } from './repositories/platformSettings.repository';
import * as message from '../../shared/http/message.http';
import { LoggerService } from '../../shared/providers/logger.service';
import { ReputationService } from '../reputation/reputation.service';

@Injectable()
export class AdminSettingsService {
  constructor(
    public readonly platformSettingsRepository: PlatformSettingsRepository,
    private logger: LoggerService,
    private reputationService: ReputationService,
  ) {}

  /**
   * @description Add new record in platform table to store limits allowed
   * @param platformPayload AddPlatformSettingsDto data
   * @param user Logged in user Info
   * @returns returns saved platform settings dto
   * @author Samsheer Alam
   */
  async addNewPlatformToLimit(
    platformPayload: AddPlatformSettingsDto,
    user: UserDto,
  ): Promise<PlatformSettingsDto> {
    try {
      const platformData = {
        ...platformPayload,
        createdBy: user,
        isDeleted: false,
      };
      const platformRef = this.platformSettingsRepository.create(platformData);
      return this.platformSettingsRepository.save(platformRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the limit allowed to add the perticular feature
   * @param platformPayload UpdatePlatformSettingsDto data
   * @returns Updated platform setting record
   * @author Samsheer Alam
   */
  async updatePlatformSetting(
    platformPayload: UpdatePlatformSettingsDto,
  ): Promise<PlatformSettingsDto> {
    try {
      const platformInfo = await this.platformSettingsRepository.findOne({
        id: platformPayload.platformSettingId,
        isDeleted: false,
      });
      if (platformInfo === undefined) {
        throw new BadRequestException(AdminSettingNotFound);
      }
      platformInfo.invites = platformPayload.invites;
      platformInfo.project = platformPayload.project;
      platformInfo.skills = platformPayload.skills;
      platformInfo.certification = platformPayload.certification;
      platformInfo.education = platformPayload.education;
      platformInfo.employment = platformPayload.employment;

      await this.platformSettingsRepository.save(platformInfo);
      this.reputationService.updateReputationForAllactiveUsers();
      return platformInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description TO get the limits allowed to add the module (such as project, skills etc)
   * @returns PlatformSettingsDto first active record from DB
   * @author Samsheer Alam
   */
  async fetchPlatformSettingRecord(): Promise<PlatformSettingsDto> {
    try {
      const platformInfo = await this.platformSettingsRepository.findOne({
        isDeleted: false,
      });
      if (platformInfo === undefined) {
        throw new BadRequestException(AdminSettingNotFound);
      }
      return platformInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
