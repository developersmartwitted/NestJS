import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { ClientProjectController } from '../clientProject.controller';
import { ClientProjectService } from '../clientProject.service';
import { AddClientProjectDto } from '../dto/payload/AddClientProjectDto';
import { UserDto } from '../../user/dto/UserDto';
import { UpdateClientProjectDto } from '../dto/payload/UpdateClientProjectDto';
import { ClientProjectDto } from '../dto/ClientProjectDto';
import { DeleteClientProjectDto } from '../dto/payload/DeleteClientProjectDto';
import { SendClientProjectInviteDto } from '../dto/payload/SendClientProjectInviteDto';
import { VerificationQuestionListDto } from 'src/modules/reputationConstant/dto/response/VerificationQuestionListDto';
import { VerifyClientProjectDto } from '../dto/payload/VerifyClientProjectDto';

jest.mock('../clientProject.service');

describe('ClientProjectController', () => {
  let controller: ClientProjectController;
  let clientProjectService: ClientProjectService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ClientProjectController],
      providers: [ClientProjectService],
    }).compile();

    controller = moduleRef.get<ClientProjectController>(
      ClientProjectController,
    );
    clientProjectService =
      moduleRef.get<ClientProjectService>(ClientProjectService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewClientProject', () => {
    describe('When addNewClientProject is called', () => {
      let payload: AddClientProjectDto;
      let user: UserDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.addNewClientProject(user, payload);
      });

      it('it should call addClientProject from clientProjectService', () => {
        expect(clientProjectService.addClientProject).toBeCalledWith(
          payload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.ClientProjectAdded,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('updateEmployment', () => {
    describe('When updateEmployment is called', () => {
      let payload: UpdateClientProjectDto;
      let user: UserDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.updateEmployment(user, payload);
      });

      it('it should call updateEmploymentData from clientProjectService', () => {
        expect(clientProjectService.updateEmploymentData).toBeCalledWith(
          payload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.ClientProjectUpdated,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('getAllClientProjects', () => {
    describe('When getAllClientProjects is called', () => {
      let user: UserDto;
      let clientProjects: ClientProjectDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.getAllClientProjects(user);
      });

      it('it should call getAllClientProjects from clientProjectService', () => {
        expect(clientProjectService.getAllClientProjctData).toBeCalledWith(
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          clientProjects,
          message.ClientProjectInfo,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteEmploymentRecord', () => {
    describe('When deleteEmploymentRecord is called', () => {
      let user: UserDto;
      let payload: DeleteClientProjectDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.deleteEmploymentRecord(
          user,
          payload,
        );
      });

      it('it should call deleteClientProjectData from clientProjectService', () => {
        expect(clientProjectService.deleteClientProjectData).toBeCalledWith(
          user,
          payload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.ClientProjectDelete,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('sendClientProjectInvite', () => {
    describe('When sendClientProjectInvite is called', () => {
      let user: UserDto;
      let payload: SendClientProjectInviteDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.sendClientProjectInvite(
          user,
          payload,
        );
      });

      it('it should call sendClientProjectInvite from clientProjectService', () => {
        expect(clientProjectService.sendClientProjectInvite).toBeCalledWith(
          user,
          payload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.ClientProjectInvite,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('getProjectQuestion', () => {
    describe('When getProjectQuestion is called', () => {
      let user: UserDto;
      let clientProjectId: string;
      let clientProjectRes: HttpResponse;
      let questionData: VerificationQuestionListDto[];

      beforeEach(async () => {
        clientProjectRes = await controller.getProjectQuestion(
          clientProjectId,
          user,
        );
      });

      it('it should call getProjectVerificationQuestion from clientProjectService', () => {
        expect(
          clientProjectService.getProjectVerificationQuestion,
        ).toBeCalledWith(clientProjectId, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          questionData,
          message.ClientProjectQues,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('getClientProjectById', () => {
    describe('When getClientProjectById is called', () => {
      let user: UserDto;
      let clientProjectId: string;
      let clientProjectRes: HttpResponse;
      let clientProjectInfo: ClientProjectDto;

      beforeEach(async () => {
        clientProjectRes = await controller.getClientProjectById(
          clientProjectId,
          user,
        );
      });

      it('it should call getClientProjectDataById from clientProjectService', () => {
        expect(clientProjectService.getClientProjectDataById).toBeCalledWith(
          clientProjectId,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          clientProjectInfo,
          message.ClientProjectInfo,
        );
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyClientProjectInvite', () => {
    describe('When verifyClientProjectInvite is called', () => {
      let user: UserDto;
      let answerPayload: VerifyClientProjectDto;
      let clientProjectRes: HttpResponse;

      beforeEach(async () => {
        clientProjectRes = await controller.verifyClientProjectInvite(
          user,
          answerPayload,
        );
      });

      it('it should call verifyClientProjectInvite from clientProjectService', () => {
        expect(clientProjectService.verifyClientProjectInvite).toBeCalledWith(
          user,
          answerPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.Verified);
        expect(clientProjectRes).toStrictEqual(result);
      });
    });
  });
});
