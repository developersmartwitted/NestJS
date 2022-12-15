import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { getConnection } from 'typeorm';

import { AdminSettingsService } from '../adminSettings/adminSettings.service';
import { ReputationService } from '../reputation/reputation.service';
import { LoggerService } from '../../shared/providers/logger.service';
import * as message from '../../shared/http/message.http';

import { UserDto } from '../user/dto/UserDto';
import { EducationDto } from './dto/EducationDto';
import { AddEducationDto } from './dto/payload/AddEducationDto';
import { CertificationRepository } from './repositories/certification.repository';
import { EducationRepository } from './repositories/education.repository';
import { EducationFileRepository } from './repositories/educationFile.repository';
import { UpdateEducationDto } from './dto/payload/UpdateEducationDto';
import { EducationFileEntity } from './entities/educationFile.entity';
import { AddCertificateDto } from './dto/payload/AddCertificateDto';
import { CertificationDto } from './dto/CertificationDto';
import { UpdateCertificateDto } from './dto/payload/UpdateCertificateDto';
import { DeleteCertificateDto } from './dto/payload/DeleteCertificateDto';
import { DeleteEducationDto } from './dto/payload/DeleteEducationDto';

@Injectable()
export class EducationService {
  constructor(
    public readonly educationRepository: EducationRepository,
    public readonly educationFileRepository: EducationFileRepository,
    public readonly certificationRepository: CertificationRepository,
    public readonly reputationService: ReputationService,
    public readonly adminSettings: AdminSettingsService,
    private logger: LoggerService,
  ) {}

  /**
   * @description Saves education info in education table and files in education_file table.
   * @param payload {AddEducationDto} data
   * @param user Logged in user info
   * @returns Saved education info of the user
   * @author Samsheer Alam
   */
  async addNewEducation(
    payload: AddEducationDto,
    user: UserDto,
  ): Promise<EducationDto> {
    try {
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const educationData = await this.educationRepository.find({
        user,
        isDeleted: false,
      });
      if (educationData.length >= maxAllowed.education) {
        throw new BadRequestException(
          `Sorry you can not add more than ${maxAllowed.education} education info.`,
        );
      }
      const educationInfo = {
        degree: payload.degree,
        school: payload.school,
        year: payload.year,
        user: user,
        isDeleted: false,
      };
      const educationRef = this.educationRepository.create(educationInfo);
      let result: EducationDto;

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        result = await queryRunner.manager.save(educationRef);
        const educationFiles = await this.getFileDataToSave(
          payload,
          result,
          'education',
        );
        await queryRunner.manager.save(educationFiles);

        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while adding education ', { error: err });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
      this.reputationService.updateReputationScore(user);
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Creates a file reference which is stored in DB
   * Called from "addNewEducation", "updateEducationDetail", "addNewCertification" and "updateCertificateDetail" functions
   * @param payload Request body data
   * @param result Saved or updated result of certification or education
   * @param type certification or education
   * @returns EducationFile Entity reference
   * @author Samsheer Alam
   */
  async getFileDataToSave(
    payload: any,
    result: any,
    type: string,
  ): Promise<EducationFileEntity> {
    try {
      const fileInfo = {
        fileName: payload.fileName,
        fileLocation: payload.fileLocation,
        fileMimeType: payload.fileMimeType,
        education: undefined,
        certification: undefined,
      };
      if (type === 'education') {
        fileInfo.education = result;
      } else {
        fileInfo.certification = result;
      }
      return this.educationFileRepository.create(fileInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
  /**
   * @description Updated the education info. Deletes the old education file and saves the new given file
   * @param user Logged in user info
   * @param educationPayload {UpdateEducationDto} data
   * @returns updated education info
   * @author Samsheer Alam
   */
  async updateEducationDetail(
    user: UserDto,
    educationPayload: UpdateEducationDto,
  ): Promise<EducationDto> {
    try {
      const educationInfo = await this.educationRepository.findOne({
        id: educationPayload.educationId,
        user,
      });
      if (educationInfo === undefined) {
        throw new BadRequestException(message.EducationNotFound);
      }

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();

      try {
        educationInfo.degree = educationPayload.degree;
        educationInfo.school = educationPayload.school;
        educationInfo.year = educationPayload.year;
        await queryRunner.manager.save(educationInfo);

        queryRunner.manager.delete(EducationFileEntity, {
          education: educationPayload.educationId,
        });
        const educationFiles = await this.getFileDataToSave(
          educationPayload,
          educationInfo,
          'education',
        );
        await queryRunner.manager.save(educationFiles);

        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while updating education detail', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
      return educationInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of active eduation details of the user
   * @param user Logged in user info
   * @returns List of education user has added
   * @author Samsheer Alam
   */
  async getEducationInfo(user: UserDto): Promise<EducationDto[]> {
    try {
      return await this.educationRepository.find({
        where: { user, isDeleted: false },
        relations: ['file'],
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the education info for the given education id.
   * @param user Logged in user info
   * @param educationId for which the info needs to be fetched
   * @returns List of education user has added
   * @author Samsheer Alam
   */
  async getEducationById(
    user: UserDto,
    educationId: string,
  ): Promise<EducationDto> {
    try {
      const educationInfo = await this.educationRepository.findOne({
        where: { id: educationId, user, isDeleted: false },
        relations: ['file'],
      });
      if (educationInfo === undefined) {
        throw new BadRequestException('Education information not found.');
      }
      return educationInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the eduaction info for the gievn id.
   * @param user Logged in user Id
   * @param educationPayload DeleteEducationDto {educationID}
   * @returns deleted education info
   * @author Samsheer Alam
   */
  async deleteEducationInfo(
    user: UserDto,
    educationPayload: DeleteEducationDto,
  ): Promise<EducationDto> {
    try {
      const educationInfo = await this.educationRepository.findOne({
        id: educationPayload.educationId,
        user,
      });
      if (educationInfo === undefined) {
        throw new BadRequestException('Education information not found.');
      }
      educationInfo.isDeleted = true;
      await this.educationRepository.save(educationInfo);
      this.reputationService.updateReputationScore(user);
      return educationInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Saves the new certification info in DB for the user
   * @param certificatePayloadDto AddCertificateDto
   * @param user Logged in user info
   * @returns Saved certificate info
   * @author Samsheer Alam
   */
  async addNewCertification(
    certificatePayloadDto: AddCertificateDto,
    user: UserDto,
  ): Promise<CertificationDto> {
    try {
      const maxAllowed = await this.adminSettings.fetchPlatformSettingRecord();
      const certificationData = await this.certificationRepository.find({
        user,
        isDeleted: false,
      });
      if (certificationData.length >= maxAllowed.certification) {
        throw new BadRequestException(
          `Sorry you can not add more than ${maxAllowed.certification} certification info.`,
        );
      }
      const certificateInfo = {
        ...certificatePayloadDto,
        user: user,
        isDeleted: false,
      };
      const certificateRef =
        this.certificationRepository.create(certificateInfo);
      let certificateResult: CertificationDto;

      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();
      try {
        certificateResult = await queryRunner.manager.save(certificateRef);
        const certificationFiles = await this.getFileDataToSave(
          certificatePayloadDto,
          certificateResult,
          'certification',
        );
        await queryRunner.manager.save(certificationFiles);
        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while adding certificate ', { error: err });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
      this.reputationService.updateReputationScore(user);
      return certificateResult;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the certification info for the given certificate id.
   * @param user Logged in user info
   * @param certificatePayload UpdateCertificateDto data
   * @returns updated certificate info
   * @author Samsheer Alam
   */
  async updateCertificateDetail(
    user: UserDto,
    certificatePayload: UpdateCertificateDto,
  ): Promise<CertificationDto> {
    try {
      const certifcateInfo = await this.certificationRepository.findOne({
        id: certificatePayload.certificateId,
        user,
      });
      if (certifcateInfo === undefined) {
        throw new BadRequestException(message.CertificateNotFound);
      }
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.startTransaction();

      try {
        certifcateInfo.certificate = certificatePayload.certificate;
        certifcateInfo.institution = certificatePayload.institution;
        certifcateInfo.year = certificatePayload.year;
        certifcateInfo.comments = certificatePayload.comments;

        await queryRunner.manager.save(certifcateInfo);

        queryRunner.manager.delete(EducationFileEntity, {
          certification: certificatePayload.certificateId,
        });
        const certificationFiles = await this.getFileDataToSave(
          certificatePayload,
          certifcateInfo,
          'certification',
        );
        await queryRunner.manager.save(certificationFiles);

        await queryRunner.commitTransaction();
      } catch (err) {
        this.logger.error('Error while updating education detail', {
          error: err,
        });
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(message.InternalServer);
      } finally {
        await queryRunner.release();
      }
      return certifcateInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of certificate added by the user
   * @param user Logged in user info
   * @returns certificates list for the user
   * @author Samsheer Alam
   */
  async getCertificateInfo(user: UserDto): Promise<CertificationDto[]> {
    try {
      return await this.certificationRepository.find({
        where: { user: user.id, isDeleted: false },
        relations: ['file'],
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the certificate info for the requested certificate id
   * @param user Logged in user info
   * @param certificateId given certificate id
   * @returns certificate info for the given id
   * @author Samsheer Alam
   */
  async getCertificateById(
    user: UserDto,
    certificateId: string,
  ): Promise<CertificationDto> {
    try {
      const certificateInfo = await this.certificationRepository.findOne({
        where: { id: certificateId, user, isDeleted: false },
        relations: ['file'],
      });
      if (certificateInfo === undefined) {
        throw new BadRequestException(message.CertificateNotFound);
      }
      return certificateInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Soft deletes the certificate.
   * @param user Logged in user info
   * @param deletePayload DeleteCertificateDto {certificateId}
   * @returns deleted certificate info
   * @author Samsheer Alam
   */
  async deleteCertificationInfo(
    user: UserDto,
    deletePayload: DeleteCertificateDto,
  ): Promise<CertificationDto> {
    try {
      const certificateInfo = await this.certificationRepository.findOne({
        id: deletePayload.certificateId,
        user,
      });
      if (certificateInfo === undefined) {
        throw new BadRequestException(message.CertificateNotFound);
      }
      certificateInfo.isDeleted = true;
      await this.certificationRepository.save(certificateInfo);
      this.reputationService.updateReputationScore(user);
      return certificateInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
