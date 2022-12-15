import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { EmploymentController } from '../employment.controller';
import { EmploymentService } from '../employment.service';
import { AddEmploymentDto } from '../dto/payload/AddEmploymentDto';
import { UpdateEmploymentDto } from '../dto/payload/UpdateEmploymentDto';
import { EmploymentDto } from '../dto/EmploymentDto';
import { VerificationQuestionListDto } from 'src/modules/reputationConstant/dto/response/VerificationQuestionListDto';
import { DeleteEmploymentDto } from '../dto/payload/DeleteEmploymentDto';
import { SendEmploymentInvite } from '../dto/payload/SendEmploymentInviteDto';
import { VerifyEmploymentDto } from '../dto/payload/VerifyEmploymentDto';

jest.mock('../employment.service');

describe('EmploymentController', () => {
  let controller: EmploymentController;
  let employmentService: EmploymentService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [EmploymentController],
      providers: [EmploymentService],
    }).compile();

    controller = moduleRef.get<EmploymentController>(EmploymentController);
    employmentService = moduleRef.get<EmploymentService>(EmploymentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewEmployment', () => {
    describe('When createNewEmployment is called', () => {
      let emmploymentPayload: AddEmploymentDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.createNewEmployment(
          user,
          emmploymentPayload,
        );
      });

      it('it should call addEmployment from employmentService', () => {
        expect(employmentService.addEmployment).toBeCalledWith(
          emmploymentPayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EmploymentAdded);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('updateEmployment', () => {
    describe('When updateEmployment is called', () => {
      let emmploymentPayload: UpdateEmploymentDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.updateEmployment(
          user,
          emmploymentPayload,
        );
      });

      it('it should call updateEmploymentData from employmentService', () => {
        expect(employmentService.updateEmploymentData).toBeCalledWith(
          emmploymentPayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EmploymentUpdated);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('getAllEmployment', () => {
    describe('When getAllEmployment is called', () => {
      let employments: EmploymentDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.getAllEmployment(user);
      });

      it('it should call getAllEmploymentData from employmentService', () => {
        expect(employmentService.getAllEmploymentData).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(employments, message.EmploymentInfo);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('getEmploymentbyId', () => {
    describe('When getEmploymentbyId is called', () => {
      let employments: EmploymentDto;
      let employmentId: string;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.getEmploymentbyId(
          employmentId,
          user,
        );
      });

      it('it should call getEmploymentDataById from employmentService', () => {
        expect(employmentService.getEmploymentDataById).toBeCalledWith(
          employmentId,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(employments, message.EmploymentInfo);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('getProjectQuestion', () => {
    describe('When getProjectQuestion is called', () => {
      let questions: VerificationQuestionListDto;
      let verificationId: string;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.getProjectQuestion(
          verificationId,
          user,
        );
      });

      it('it should call getEmploymmentVerificationQuestion from employmentService', () => {
        expect(
          employmentService.getEmploymmentVerificationQuestion,
        ).toBeCalledWith(verificationId, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(questions, message.EmploymentQues);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteEmploymentRecord', () => {
    describe('When deleteEmploymentRecord is called', () => {
      let deletePayload: DeleteEmploymentDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.deleteEmploymentRecord(
          user,
          deletePayload,
        );
      });

      it('it should call deleteEmploymentData from employmentService', () => {
        expect(employmentService.deleteEmploymentData).toBeCalledWith(
          user,
          deletePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EmploymentDelete);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('sendEmploymentInvite', () => {
    describe('When sendEmploymentInvite is called', () => {
      let invitePayload: SendEmploymentInvite;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.sendEmploymentInvite(
          user,
          invitePayload,
        );
      });

      it('it should call sendEmploymentInvite from employmentService', () => {
        expect(employmentService.sendEmploymentInvite).toBeCalledWith(
          user,
          invitePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EmploymentInvite);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyQuestionsAnswer', () => {
    describe('When verifyQuestionsAnswer is called', () => {
      let verifyPayload: VerifyEmploymentDto;
      let user: UserDto;
      let reputationConstRes: HttpResponse;

      beforeEach(async () => {
        reputationConstRes = await controller.verifyQuestionsAnswer(
          verifyPayload,
          user,
        );
      });

      it('it should call verifyQuestionsAnswer from employmentService', () => {
        expect(employmentService.verifyQuestionsAnswer).toBeCalledWith(
          verifyPayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.Verified);
        expect(reputationConstRes).toStrictEqual(result);
      });
    });
  });
});
