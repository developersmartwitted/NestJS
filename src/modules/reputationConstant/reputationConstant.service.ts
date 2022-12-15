import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { LoggerService } from '../../shared/providers/logger.service';
import { UserDto } from '../user/dto/UserDto';
import { AnswerDto } from './dto/Answer.dto';
import { AddAnswerDto } from './dto/payload/AddAnswerDto';
import { AddQuestionDto } from './dto/payload/AddQuestionDto';
import { AddReputationWeightDto } from './dto/payload/AddReputationWeightDto';
import { UpdateReputationWeightDto } from './dto/payload/UpdateReputationWeightDto';
import { QuestionDto } from './dto/QuestionDto';
import { ReputationWeightDto } from './dto/ReputationWeightDto';
import { UserAnswerMapDto } from './dto/UserAnswerMapDto';
import { AnswerType } from './enums/answerType.enum';
import { QuestionType } from './enums/questionType.enum';
import { AnswerRepository } from './repositories/answer.repository';
import { QuestionRepository } from './repositories/question.repository';
import { ReputationWeightRepository } from './repositories/reputationWeight.repository';
import { UserAnswerMapRepository } from './repositories/userAnswerMap.repository';
import * as message from '../../shared/http/message.http';
import { ReputationService } from '../reputation/reputation.service';

@Injectable()
export class ReputationConstantService {
  constructor(
    private readonly reputationWeightRepository: ReputationWeightRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly userAnswerMapRepository: UserAnswerMapRepository,
    private logger: LoggerService,
    private reputationService: ReputationService,
  ) {}

  /**
   * @description If nno record is present in DB then it saves weigghtages as new record
   * @param reputationWeights AddReputationWeightDto {basicKyc, advanceKyc, skills, education, certification, employment, clientProject}
   * @param user Logged in user data
   * @returns Saved reputation weight dto data
   * @author Samsheer Alam
   */
  async addReputationWeightage(
    reputationWeights: AddReputationWeightDto,
    user: UserDto,
  ): Promise<ReputationWeightDto> {
    try {
      const maxPercent = 100;
      if (
        reputationWeights.basicKyc +
          reputationWeights.advanceKyc +
          reputationWeights.skillRating !==
        maxPercent
      ) {
        throw new UnprocessableEntityException(
          'Sum of Basic, Advance and SkillRating should be 100%.',
        );
      }
      if (
        reputationWeights.education +
          reputationWeights.skills +
          reputationWeights.certification +
          reputationWeights.clientProject +
          reputationWeights.employmentHistory !==
        maxPercent
      ) {
        throw new UnprocessableEntityException(
          'Sum of Skills, Education, Certification, Project and Employment should be 100%.',
        );
      }

      const reputation = await this.reputationWeightRepository.find();
      if (reputation.length > 0) {
        throw new BadRequestException('Reputation weightage is already added.');
      }

      const weightPayload = { ...reputationWeights, createdBy: user };
      const weightRef = this.reputationWeightRepository.create(weightPayload);
      return await this.reputationWeightRepository.save(weightRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Updates the weight record in DB
   * @param reputationWeights AddReputationWeightDto {basicKyc, advanceKyc, skills, education, certification, employment, clientProject}
   * @returns Updated reputation weight dto data
   * @author Samsheer Alam
   */
  async updateReputationWeightage(
    reputationWeights: UpdateReputationWeightDto,
  ): Promise<ReputationWeightDto> {
    try {
      const reputation = await this.reputationWeightRepository.findOne({
        id: reputationWeights.reputationId,
      });
      if (reputation === undefined) {
        throw new BadRequestException('Reputation weightage not found.');
      }
      const maxPercent = 100;
      if (
        reputationWeights.basicKyc +
          reputationWeights.advanceKyc +
          reputationWeights.skillRating !==
        maxPercent
      ) {
        throw new UnprocessableEntityException(
          'Sum of Basic, Advance and SkillRating should be 100%.',
        );
      }
      if (
        reputationWeights.skills +
          reputationWeights.education +
          reputationWeights.certification +
          reputationWeights.clientProject +
          reputationWeights.employmentHistory !==
        maxPercent
      ) {
        throw new UnprocessableEntityException(
          'Sum of Skills, Education, Certification, Project and Employment should be 100%.',
        );
      }
      reputation.basicKyc = reputationWeights.basicKyc;
      reputation.advanceKyc = reputationWeights.advanceKyc;
      reputation.skills = reputationWeights.skills;
      reputation.education = reputationWeights.education;
      reputation.certification = reputationWeights.certification;
      reputation.clientProject = reputationWeights.clientProject;
      reputation.employmentHistory = reputationWeights.employmentHistory;
      reputation.skillRating = reputationWeights.skillRating;

      const updatedWeights = await this.reputationWeightRepository.save(
        reputation,
      );
      this.reputationService.updateReputationForAllactiveUsers();
      return updatedWeights;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the Reputation weight record from DB.
   * @returns ReputationWeightDto data {basicKyc, advanceKyc, skills, education, certification, employment, clientProject}
   * @author Samsheer Alam
   */
  async fetchReputationWeightage(): Promise<ReputationWeightDto> {
    try {
      const reputation = await this.reputationWeightRepository.findOne();
      if (reputation === undefined) {
        throw new BadRequestException('Reputation weightage is not added yet.');
      }
      return reputation;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To save questions in DB, parentQuestion is sent in request if the sub question needs to be added
   * @param questionPayload AddQuestionDto data
   * @returns Saved question
   * @author Samsheer Alam
   */
  async addQuestion(questionPayload: AddQuestionDto): Promise<QuestionDto> {
    try {
      const questionData = {
        ...questionPayload,
        status: true,
        type: QuestionType[questionPayload.questionType],
        parentQuestion: questionPayload.parentQuestionId,
      };
      const questionRef = this.questionRepository.create(questionData);
      return await this.questionRepository.save(questionRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To save answer for the given question
   * @param answerPayload AddAnswerDto data
   * @returns Saved answers
   * @author Samsheer Alam
   */
  async addAnswer(answerPayload: AddAnswerDto): Promise<AnswerDto> {
    try {
      const questionInfo = await this.questionRepository.findOne({
        id: answerPayload.questionId,
      });
      if (questionInfo === undefined) {
        throw new NotFoundException('Question not found');
      }
      const answerData = {
        question: questionInfo,
        answer: answerPayload.answer,
        value: answerPayload.value,
        type: AnswerType[answerPayload.answerType],
      };

      const answerRef = this.answerRepository.create(answerData);
      return await this.answerRepository.save(answerRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of questions for the given type
   * @param questionType Type of Question(SKILLS, EMPLOYMENT, CLIENT_PROJECT)
   * @returns Array of QuestionDto data
   * @author Samsheer Alam
   */
  async getQuestionsWithAnswer(
    questionType: QuestionType,
  ): Promise<QuestionDto[]> {
    try {
      return await this.questionRepository
        .createQueryBuilder('question')
        .where('question.type = :questionType', { questionType })
        .andWhere('question.status = :status', { status: true })
        .leftJoinAndSelect('question.answers', 'answers.id')
        .getMany();
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from clientproject, skill and employment verification functions to store answers given by the user
   * @param userAnswers Array of answers that is  array UserAnswerMapDto data
   * @returns Saved user answer map dto data
   * @author Samsheer Alam
   */
  async saveUsersAnswer(
    userAnswers: UserAnswerMapDto[],
  ): Promise<UserAnswerMapDto[]> {
    try {
      const usersAnswerRef = this.userAnswerMapRepository.create(userAnswers);
      return await this.userAnswerMapRepository.save(usersAnswerRef);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
