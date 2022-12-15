import { Injectable } from '@nestjs/common';

import { LoggerService } from '../../../shared/providers/logger.service';
import { PlatformSettingsDto } from '../../adminSettings/dto/PlatformSettingsDto';
import { PlatformSettingsRepository } from '../../adminSettings/repositories/platformSettings.repository';
import { ClientProjectRepository } from '../../clientProject/repositories/clientProject.repository';
import { CertificationRepository } from '../../education/repositories/certification.repository';
import { EducationRepository } from '../../education/repositories/education.repository';
import { EmploymentRepository } from '../../employment/repositories/employment.repository';
import { ReputationWeightRepository } from '../../reputationConstant/repositories/reputationWeight.repository';
import { SkillUserMapRepository } from '../../skill/repositories/skillUserMap.repository';
import { SkillVerificationRepository } from '../../skill/repositories/skillVerification.repository';
import { UserDto } from '../../user/dto/UserDto';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class KYCService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly platformSetting: PlatformSettingsRepository,
    private readonly reputationWeights: ReputationWeightRepository,
    private readonly skillVerify: SkillVerificationRepository,
    private readonly userSkills: SkillUserMapRepository,
    private readonly educationRepo: EducationRepository,
    private readonly certificationRepo: CertificationRepository,
    private readonly userEmployment: EmploymentRepository,
    private readonly userPersonalProject: ClientProjectRepository,
    private logger: LoggerService,
  ) {}

  /**
   * @description KYC scrore consist of three parameters (Basic KYC(Levle1), AdvanceKYC(level 2), Skill Vouching(Level3))
   * and it defined by the percentage of each parameter completed. and the final scrore is taken as per given weightage
   *
   * 1. Basic KYC represent the completion of basic info by user (signup flow is considered here)
   *    There are 13 form fields which needs to entered by user, if  all fields are entered than Basic KYC 100% is completed.
   *
   * 2. Advance KYC: This represents the completion of skills, education, certification, clientProject, employment info.
   *    Admin can define the max no of skill, education, certification, clientProject, employment info can be given by user.
   *    If the user adds the max no of each parameter, than Advance KYC is considered as 100%.
   *
   * 3. Skill Vouching(Level3), is only for the skills, It is calculated based on Per skill rating,
   *    which is weightage divided by no of skills entered by the user.
   *    Skill rating is calculated as on no of user who has verified the skill divided by the no of invitation sent to verify the skill
   *    multiplied by per skill rating.
   *
   * @param user UserDto data
   * @returns final Kyc score
   * @author Samsheer Alam
   */
  async getKycScore(user: UserDto): Promise<number> {
    try {
      const kycWeightages = await this.reputationWeights.findOne();
      const basicKycScore = await this.getBasicKycScore(
        user,
        kycWeightages.basicKyc,
      );
      const advanceKycScore = await this.getAdvanceKycScore(
        user,
        kycWeightages.advanceKyc,
      );
      const skillRatingScore = await this.getSkillRatingScore(
        user,
        kycWeightages.skillRating,
      );

      return basicKycScore + advanceKycScore + skillRatingScore;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * @description Checks the no of information filled  by the user while registeration as basic KYC completion score
   * and then based on basic kyc weight score is calculated
   * @param user UserDto data
   * @param weight BasicKyc weight
   * @returns Basic KYC score
   * @author Samsheer Alam
   */
  async getBasicKycScore(user: UserDto, weight: number): Promise<number> {
    try {
      const userInfo = await this.userRepository.getUserInfoById(user.id);
      if (userInfo.length <= 0) {
        return 0;
      }
      const userDetail: any = userInfo[0];
      const userData = {
        email: userDetail?.email,
        firstName: userDetail?.firstName,
        lastName: userDetail?.lastName,
        password: 'sometext',
        address: userDetail?.address,
        state: userDetail?.state,
        country: userDetail?.country,
        phone: userDetail?.phoneNumber,
        personalSite: userDetail?.personalWebsite,
        profileImage: userDetail?.profileImage,
        hourlyRate: userDetail?.hourlyRate,
        externalLinks: userDetail?.externalLinks,
        about: userDetail?.about,
      };
      let filledFieldsCount = 0;
      let totalFields = 0;

      for (const key in userData) {
        totalFields++;
        if (
          userData[key] !== '' &&
          userData[key] !== null &&
          userData[key] !== undefined
        ) {
          filledFieldsCount++;
        }
      }

      const completionPercent = (filledFieldsCount / totalFields) * 100;
      return (completionPercent * weight) / 100;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * @description Checks Skill, employment, project and education info given by user, based on that completion percent is calculated
   * And then based on advance KYC weight advance kyc score is calculated
   * @param user UserDto data
   * @param weight advance kyc weight
   * @returns Advance KYC score
   * @author Samsheer Alam
   */
  async getAdvanceKycScore(user: UserDto, weight: number): Promise<number> {
    try {
      const data = await this.getAdvanceKycDBData(user);
      const max = data.platformSetting;
      const noOfAdvanceKycParameter = 5;

      const completionPercent =
        ((await this.getAdvanceKycPercent(data.userSkillCount, max.skills)) +
          (await this.getAdvanceKycPercent(
            data.userProjectCount,
            max.project,
          )) +
          (await this.getAdvanceKycPercent(data.userEmpCount, max.employment)) +
          (await this.getAdvanceKycPercent(data.userEduCount, max.education)) +
          (await this.getAdvanceKycPercent(
            data.userCertificateCount,
            max.certification,
          ))) /
        noOfAdvanceKycParameter;
      return (completionPercent * weight) / 100;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * @description Function to calculate completion percent for each advance KYC parameter
   * @param parameterCount No of times user has added that parameter.
   * @param maxCount Max number of count that the user can add that parameter
   * @returns Completion percent
   * @author Samsheer Alam
   */
  async getAdvanceKycPercent(
    parameterCount: number,
    maxCount: number,
  ): Promise<number> {
    return (
      (parameterCount > maxCount ? maxCount : parameterCount / maxCount) * 100
    );
  }

  /**
   * @description Runs the DB query to fetch the records needed to calculated advance KYC score
   * @param user UserDto data
   * @returns skill, employment, education, certifictaion and project count user has given and platform settings data
   * @author Samsheer Alam
   */
  async getAdvanceKycDBData(user: UserDto): Promise<{
    platformSetting: PlatformSettingsDto;
    userSkillCount: number;
    userEmpCount: number;
    userProjectCount: number;
    userEduCount: number;
    userCertificateCount: number;
  }> {
    try {
      const queryResult = await Promise.all([
        this.platformSetting.findOne({ isDeleted: false }),
        this.userSkills.count({ status: true, user }),
        this.userEmployment.count({ isDeleted: false, user }),
        this.userPersonalProject.count({ isDeleted: false, user }),
        this.educationRepo.count({ isDeleted: false, user }),
        this.certificationRepo.count({ isDeleted: false, user }),
      ]);
      return {
        platformSetting: queryResult[0],
        userSkillCount: queryResult[1],
        userEmpCount: queryResult[2],
        userProjectCount: queryResult[3],
        userEduCount: queryResult[4],
        userCertificateCount: queryResult[5],
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Calculates skill rating score for KYC score
   * @param user UserDto data
   * @param weightage Skill Rating weight
   * @returns skill rating score
   * @author Samsheer Alam
   */
  async getSkillRatingScore(user: UserDto, weightage: number): Promise<number> {
    try {
      const userSkills = await this.userSkills.find({ status: true, user });
      const perSkillRating = weightage / userSkills.length;
      let skillRationScore = 0;

      await Promise.all(
        userSkills.map(async (item: any) => {
          const skillVerification = await this.skillVerify.find({
            skillUserMap: item,
          });
          const inviteCount = skillVerification.length;
          const verifiedCount = skillVerification.filter(
            (it) => it.isVerified,
          ).length;
          skillRationScore +=
            inviteCount === 0
              ? 0
              : (verifiedCount / inviteCount) * perSkillRating;
        }),
      );
      return skillRationScore;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }
}
