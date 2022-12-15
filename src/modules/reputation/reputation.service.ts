import { Injectable } from '@nestjs/common';
import { AppGateway } from '../../helpers/gateway/app.gateway';

import { LoggerService } from '../../shared/providers/logger.service';
import { UserDto } from '../user/dto/UserDto';
import { ProfileRepository } from '../user/repositories/profile.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { KYCService } from './parameters/kyc.service';
import { NPSService } from './parameters/npsService';
import { PeerRatingService } from './parameters/peerRating.service';
import { RevenueScoreService } from './parameters/revenueScoreService';

@Injectable()
export class ReputationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepo: ProfileRepository,
    private readonly kycService: KYCService,
    private readonly peerRatingService: PeerRatingService,
    private readonly npsService: NPSService,
    private readonly revenueScoreService: RevenueScoreService,
    private logger: LoggerService,
    private appGateway: AppGateway,
  ) {}

  /**
   * @description Called "calculateAndUpdateScore" function setTimeOut to make sure the api response is sent from the function called
   * and then "calculateAndUpdateScore" is called
   * @param user UserDto info
   * @returns finalScore
   * @author Samsheer Alam
   */
  async updateReputationScore(user: UserDto): Promise<void> {
    setTimeout((user) => this.calculateAndUpdateScore(user), 0, user);
    return;
  }

  /**
   * @description Calculates reputation score based on kyc, nps, peerRating and revenue score
   * @param user UserDto info
   * @returns finalScore
   * @author Samsheer Alam
   */
  async calculateAndUpdateScore(user: UserDto): Promise<number> {
    try {
      const kycScore = await this.kycService.getKycScore(user);
      const npsScore = await this.npsService.getNpsScore(user);
      const peerRatingScore = await this.peerRatingService.getPeerRatingScore(
        user,
      );
      const revenueScore = await this.revenueScoreService.getRevenueScore();
      const finalScore = await this.getFinalScore({
        kycScore,
        npsScore,
        peerRatingScore,
        revenueScore,
      });
      await this.userProfileRepo
        .createQueryBuilder()
        .update()
        .set({
          reputationScore: finalScore,
        })
        .where('user_id = :userId', { userId: user.id })
        .execute();
      this.appGateway.triggerEvent(
        `reputation-${user.id}`,
        { reputationScore: finalScore },
        user.id,
      );
      return finalScore;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * Calculates final score based on weightage of  each parameters
   * @param scores {  kycScore,  npsScore, peerRatingScore, revenueScore}
   * @returns sum of weightageScore
   * @author Samsheer Alam
   */
  async getFinalScore(scores: {
    kycScore: number;
    npsScore: number;
    peerRatingScore: number;
    revenueScore: number;
  }): Promise<number> {
    try {
      const maxScore = 900;
      const { peerRatingScore, kycScore, npsScore, revenueScore } = scores;
      const kycWeight = 10,
        npsWeight = 30,
        peerRatingWeight = 50,
        revenueWeight = 10;

      const kycWeightScore = (maxScore * kycWeight) / 100;
      const npsWeightScore = (maxScore * npsWeight) / 100;
      const peerWeightScore = (maxScore * peerRatingWeight) / 100;
      const revenueWeightScore = (maxScore * revenueWeight) / 100;

      const kyc = (kycScore / 100) * kycWeightScore;
      const nps = (npsScore / 100) * npsWeightScore;
      const peerRating = (peerRatingScore / 100) * peerWeightScore;
      const revenue = (revenueScore / 100) * revenueWeightScore;

      const reputationScore = kyc + nps + peerRating + revenue;
      return Number(reputationScore.toFixed(2));
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * @description This function called when ever reputation weightage from admin side is updated.
   * This loops through all active users and updates new reputation score in DB
   * @author Samsheer Alam
   */
  async updateReputationForAllactiveUsers(): Promise<void> {
    try {
      const users = await this.userRepository.find({ status: true });
      users.map((user) => this.calculateAndUpdateScore(user));
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Called from skill service. whenever new skill is added by the user, reputation for the user is calculated.
   * And also for the users whose skill, project or employment is verified by this user.
   * Because in PeerRating caluculation, based on same skill or different skill score has an impact
   * @param user Logged in user info
   * @author Samsheer Alam
   */
  async fetchVerifiersAndUpdateReputaion(user: UserDto) {
    this.updateReputationScore(user);
    const where = `user.id in (Select distinct(invited_by_id) from user_answer_map where verified_by_id = '${user.id}')`;
    const allQuestionVerifiedByUser = await this.userRepository
      .createQueryBuilder('user')
      .where(where)
      .getMany();
    allQuestionVerifiedByUser.map((userItem: UserDto) => {
      this.updateReputationScore(userItem);
    });
  }
}
