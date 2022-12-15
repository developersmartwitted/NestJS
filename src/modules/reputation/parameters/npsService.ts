import { Injectable } from '@nestjs/common';

import { LoggerService } from '../../../shared/providers/logger.service';
import { UserAnswerMapRepository } from '../../reputationConstant/repositories/userAnswerMap.repository';
import { UserDto } from '../../user/dto/UserDto';

@Injectable()
export class NPSService {
  constructor(
    private readonly userAnswerRepo: UserAnswerMapRepository,
    private logger: LoggerService,
  ) {}

  /**
   * @description Fetches the nps question and answers, then promoters and detractors are separated and then NPS score is calculated
   * PROMOTERS 9 and 10, PASSIVES 7 and 8, DETRACTORS 0 to 6.
   * @param user UserDto data
   * @returns NPS score
   * @author Samsheer Alam
   */
  async getNpsScore(user: UserDto): Promise<number> {
    try {
      const usersNPSAnswers = await this.userAnswerRepo.find({
        where: { invitedBy: user, isNps: true },
        relations: [
          'invitedBy',
          'verifiedBy',
          'verifiedBy.skills',
          'verifiedBy.skills.skill',
          'question',
          'question.answers',
          'answer',
        ],
      });

      let promoters = 0;
      let detractors = 0;
      usersNPSAnswers.forEach((item) => {
        const userAnswer = item?.value;
        if (userAnswer <= 6) {
          detractors++;
        } else if (userAnswer >= 9 && userAnswer <= 10) {
          promoters++;
        }
      });
      const totalResponse = usersNPSAnswers.length;
      const promoteScore = promoters / totalResponse;
      const detractScore = detractors / totalResponse;
      const npsScore =
        totalResponse === 0 ? 0 : (promoteScore - detractScore) * 100;
      return npsScore;
    } catch (error) {
      this.logger.error(error?.message, error);
      return 0;
    }
  }
}
