import { Injectable } from '@nestjs/common';

import { AnswerType } from '../../reputationConstant/enums/answerType.enum';
import { LoggerService } from '../../../shared/providers/logger.service';
import { UserAnswerMapDto } from '../../reputationConstant/dto/UserAnswerMapDto';
import { UserAnswerMapRepository } from '../../reputationConstant/repositories/userAnswerMap.repository';
import { SkillUserMapRepository } from '../../skill/repositories/skillUserMap.repository';
import { UserDto } from '../../user/dto/UserDto';

@Injectable()
export class PeerRatingService {
  constructor(
    private readonly userAnswerRepo: UserAnswerMapRepository,
    private readonly userSkills: SkillUserMapRepository,
    private logger: LoggerService,
  ) {}

  /**
   * @description This is the boot function for PeerRatingScore calculation
   * 1. Fetches all answers except nps answers from user_answer_map table
   * 2. Fetches users skill ids
   * 3. In "getDataGroupedWithVerificationId" function all answers data is arranged such that we receive
   *    Array in which each object contains set of question answered for one invite
   * 4. In "getPeerRatingsResult" function, data from "getDataGroupedWithVerificationId" is passed, Here it is again looped through each invite
   *    and peerRatingScore for each invite is calculated. Finally from this function
   *    "total no of invites(peer count)" and "Sum of all peer rating score" is returned
   * 5. Finally PeerRatingScore is returned it is the "Sum of all peer rating score" divided by "total no of invites(peer count)" * 100
   *    to return the value in 100.
   * @param user Logged in user info or user info for which reputation is calculated
   * @returns Final peer rating score
   * @author Samsheer Alam
   */
  async getPeerRatingScore(user: UserDto): Promise<number> {
    try {
      const userSkillAndAnswer = await this.getUsersSkillAndAnswers(user);
      const arrangedData = await this.getDataGroupedWithVerificationId(
        userSkillAndAnswer,
      );
      const { peerCount, totalRatingScore } = await this.getPeerRatingsResult(
        arrangedData,
      );
      const maxPeerRating = peerCount * 5;
      const finalPeerRatingScore =
        totalRatingScore === 0 ? 0 : (totalRatingScore / maxPeerRating) * 100;
      return finalPeerRatingScore;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }

  /**
   * @description Loops through each verification Invite, and calculates ratings in 5 for each verification Invite.
   * And then sums all the ratings and verifier count.
   * @param data Arranged by verificationId so that we can loop through each verificaionInvite
   * @returns Sum of  ratings and verifier count (peer count)
   * @author Samsheer Alam
   */
  async getPeerRatingsResult(
    data,
  ): Promise<{ peerCount: number; totalRatingScore: number }> {
    let peerScore = 0;
    let peerCount = 0;
    for (const key in data) {
      const allVerifications = data[key];
      let relationWeight = 0,
        relationQuestionWeight = 0,
        questionTwoValue = 0,
        questionTwoCount = 0,
        questionTwoWeight = 0,
        isSameSkill = false,
        answerCount = 0;

      allVerifications.map((item) => {
        isSameSkill =
          item?.isSameSkill === undefined ? false : item?.isSameSkill;
        if (item?.answerWeight !== 0) {
          relationWeight =
            item?.answerWeight === undefined ? 0 : item?.answerWeight;
          relationQuestionWeight =
            item?.questionWeight === undefined ? 0 : item?.questionWeight;
        } else {
          questionTwoCount++;
          questionTwoValue +=
            item?.answerValue === undefined ? 0 : item?.answerValue;
          questionTwoWeight =
            item?.questionWeight === undefined ? 0 : item?.questionWeight;
          answerCount =
            item?.possibleAnswerCount === undefined
              ? 0
              : item?.possibleAnswerCount;
        }
      });

      questionTwoValue =
        questionTwoCount === 0 ? 0 : questionTwoValue / questionTwoCount;

      const answerTwoValue =
        answerCount === 0 ? 0 : (questionTwoValue / answerCount) * 5;

      const relationScore =
        (((relationQuestionWeight / 100) * 5) / 100) * relationWeight;
      const ratingInFive =
        relationScore * answerTwoValue * (questionTwoWeight / 100) +
        relationScore;

      const ratingValue = isSameSkill ? 1 : 0.75;
      const finalRating = ratingValue * ratingInFive;
      peerScore = peerScore + finalRating;
      peerCount++;
    }
    return { peerCount, totalRatingScore: peerScore };
  }

  /**
   * @description DB query is runned to fetch users question with answer and users skillids
   * Called from getPeerRatingScore function
   * @param user UserDto data
   * @returns returns answers for question user has sent the invite and user skill from DB
   * @author Samsheer Alam
   */
  async getUsersSkillAndAnswers(user: UserDto): Promise<{
    userSkillIds: string[];
    userAnswers: UserAnswerMapDto[];
  } | null> {
    try {
      const promiseResult = await Promise.all([
        this.getUserSkillIds(user),
        this.getUsersAnswer(user),
      ]);
      const userSkillIds = promiseResult[0];
      const userAnswers = promiseResult[1];
      return { userSkillIds, userAnswers };
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description runs db query to fetch user skills ids
   * @param user User DTO data
   * @returns users skill ids
   * @author Samsheer Alam
   */
  async getUserSkillIds(user: UserDto): Promise<string[] | null> {
    try {
      const getUserSkills = await this.userSkills.find({
        where: { user },
        relations: ['skill'],
      });
      return getUserSkills.map((item: any) => item?.skill?.id);
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Runs query to fetch list of users invites answers
   * @param user UserDto data
   * @returns UserAnswerMap data
   * @author Samsheer Alam
   */
  async getUsersAnswer(user: UserDto): Promise<UserAnswerMapDto[] | null> {
    try {
      return await this.userAnswerRepo.find({
        where: { invitedBy: user, isNps: false },
        relations: [
          'verifiedBy',
          'verifiedBy.skills',
          'verifiedBy.skills.skill',
          'question',
          'question.answers',
          'answer',
        ],
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Loops through all answer and groups based on verification Id,
   * so that it is grouped as a set of question answered for one invite
   * @param userSkillAndAnswer All users all questions answer from DB
   * @returns Array of arranged Data {verificationId, answerValue,answerWeight,questionWeight,isSameSkill}
   * @author Samsheer Alam
   */
  async getDataGroupedWithVerificationId(userSkillAndAnswer: {
    userSkillIds: string[];
    userAnswers: UserAnswerMapDto[];
  }) {
    try {
      const result = {};
      const { userSkillIds, userAnswers } = userSkillAndAnswer;
      await Promise.all(
        userAnswers.map(async (item: any) => {
          if (result[item?.verificationId] === undefined) {
            result[item?.verificationId] = [];
          }
          await result[item?.verificationId].push({
            verificationId: item?.verificationId,
            answerValue: await this.getAnswersValue(item),
            answer: item?.answer,
            answerWeight: item?.answer?.weight,
            questionWeight: item?.question?.weightage,
            isSameSkill: await this.checkIfSameSkill(item, userSkillIds),
            possibleAnswerCount: await this.getPossibleAnswerCount(item),
          });
        }),
      );
      return result;
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description If answer type is rating then given value  is returned or if it is undefined 0 is returned
   * @param item Users answer data.
   * @returns answer value
   * @author Samsheer Alam
   */
  async getAnswersValue(item: UserAnswerMapDto): Promise<number> {
    return item?.answerType === AnswerType.RATING
      ? item?.value
      : item?.answer?.value === undefined
      ? 0
      : item?.answer?.value;
  }

  /**
   * @description Returns the number of possible answer question can have
   * @param item UserAnswerMapDto data
   * @returns no of options answer has
   * @author Samsheer Alam
   */
  async getPossibleAnswerCount(item): Promise<number> {
    return item?.answerType === AnswerType.DROPDOWN
      ? item?.question?.answers?.length === undefined
        ? 0
        : item?.question?.answers?.length
      : item?.answerType === AnswerType.RATING
      ? item?.question?.answers[0]?.answer === undefined
        ? 0
        : Number(item?.question?.answers[0]?.answer)
      : 0;
  }

  /**
   * @description check if the user has same skill as the verifier and returns true or false
   * @param item UserAnswer data
   * @param userSkillIds user skill ids
   * @returns boolean, true if same skill, false if different skill
   * @author Samsheer Alam
   */
  async checkIfSameSkill(item, userSkillIds: string[]): Promise<boolean> {
    try {
      const status =
        item?.verifiedBy?.skills === undefined
          ? false
          : item?.verifiedBy?.skills?.length <= 0
          ? false
          : item?.verifiedBy?.skills.some((itm) =>
              userSkillIds.includes(itm?.skill?.id),
            );
      return status;
    } catch (error) {
      this.logger.error(error?.message, error);
      return false;
    }
  }
}
