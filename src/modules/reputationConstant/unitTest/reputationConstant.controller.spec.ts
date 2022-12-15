import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { ReputationConstantController } from '../reputationConstant.controller';
import { ReputationConstantService } from '../reputationConstant.service';
import { AddReputationWeightDto } from '../dto/payload/AddReputationWeightDto';
import { UpdateReputationWeightDto } from '../dto/payload/UpdateReputationWeightDto';
import { ReputationWeightDto } from '../dto/ReputationWeightDto';
import { AddQuestionDto } from '../dto/payload/AddQuestionDto';
import { AddAnswerDto } from '../dto/payload/AddAnswerDto';

jest.mock('../reputationConstant.service');

describe('ReputationConstantController', () => {
  let controller: ReputationConstantController;
  let reputationConstService: ReputationConstantService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ReputationConstantController],
      providers: [ReputationConstantService],
    }).compile();

    controller = moduleRef.get<ReputationConstantController>(
      ReputationConstantController,
    );
    reputationConstService = moduleRef.get<ReputationConstantService>(
      ReputationConstantService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addWeightageForReputation', () => {
    describe('When addWeightageForReputation is called', () => {
      let reputationWeights: AddReputationWeightDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.addWeightageForReputation(
          reputationWeights,
          user,
        );
      });

      it('it should call addReputationWeightage from reputationConstService', () => {
        expect(reputationConstService.addReputationWeightage).toBeCalledWith(
          reputationWeights,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.AddWeightage);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('updateWeightageForReputation', () => {
    describe('When updateWeightageForReputation is called', () => {
      let reputationWeights: UpdateReputationWeightDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.updateWeightageForReputation(
          reputationWeights,
        );
      });

      it('it should call updateReputationWeightage from reputationConstService', () => {
        expect(reputationConstService.updateReputationWeightage).toBeCalledWith(
          reputationWeights,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedWeightage);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('getWeightageForReputation', () => {
    describe('When getWeightageForReputation is called', () => {
      let reputationWeights: ReputationWeightDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.getWeightageForReputation();
      });

      it('it should call fetchReputationWeightage from reputationConstService', () => {
        expect(
          reputationConstService.fetchReputationWeightage,
        ).toHaveBeenCalled();
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          reputationWeights,
          message.WeightageInfo,
        );
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('CreateQuestion', () => {
    describe('When CreateQuestion is called', () => {
      let questionPayload: AddQuestionDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.CreateQuestion(questionPayload);
      });

      it('it should call addQuestion from reputationConstService', () => {
        expect(reputationConstService.addQuestion).toBeCalledWith(
          questionPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedWeightage);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('CreateAnswer', () => {
    describe('When CreateAnswer is called', () => {
      let answerPayload: AddAnswerDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.CreateAnswer(answerPayload);
      });

      it('it should call addAnswer from reputationConstService', () => {
        expect(reputationConstService.addAnswer).toBeCalledWith(answerPayload);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedWeightage);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });
});
