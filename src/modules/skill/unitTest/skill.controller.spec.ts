import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { SkillController } from '../skill.controller';
import { SkillService } from '../skill.service';
import { AddSkillDto } from '../dto/payload/AddSkillDto';
import { userMockData } from '../../user/unitTest/mockData/user.service.mockdata';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { SkillDto } from '../dto/SkillDto';
import { AddUserSkillDto } from '../dto/payload/AddUserSkillDto';
import { UserSkillDto } from '../dto/response/UserSkillDto';
import { SkillInviteDto } from '../dto/payload/SkillInviteDto';
import { VerifySkillDto } from '../dto/payload/VerifySkillDto';
import { VerificationQuestionListDto } from 'src/modules/reputationConstant/dto/response/VerificationQuestionListDto';

jest.mock('../skill.service');

describe('SkillController', () => {
  let controller: SkillController;
  let skillService: SkillService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [SkillController],
      providers: [SkillService],
    }).compile();

    controller = moduleRef.get<SkillController>(SkillController);
    skillService = moduleRef.get<SkillService>(SkillService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addSkills', () => {
    describe('When addSkills is called', () => {
      let skillsPayloadDto: AddSkillDto;
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;

      beforeEach(async () => {
        skillRes = await controller.addSkills(skillsPayloadDto, user);
      });

      it('it should call addSkills from skillService', () => {
        expect(skillService.addSkills).toBeCalledWith(
          skillsPayloadDto,
          user?.id,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.SkillAdded);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('getSkills', () => {
    describe('When getSkills is called', () => {
      let filterDto: FilterDto;
      let skillRes: HttpResponse;
      let skills: SkillDto;

      beforeEach(async () => {
        skillRes = await controller.getSkills(filterDto);
      });

      it('it should call getSkills from skillService', () => {
        expect(skillService.getSkills).toBeCalledWith(filterDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(skills, message.SkillInfo);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('addUserSkill', () => {
    describe('When addUserSkill is called', () => {
      let payloadDto: AddUserSkillDto;
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;

      beforeEach(async () => {
        skillRes = await controller.addUserSkill(payloadDto, user);
      });

      it('it should call addSkills from skillService', () => {
        expect(skillService.addUserSkill).toBeCalledWith(payloadDto, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.SkillAdded);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('getUserSkills', () => {
    describe('When getUserSkills is called', () => {
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;
      let skills: UserSkillDto;

      beforeEach(async () => {
        skillRes = await controller.getUserSkills(user);
      });

      it('it should call getUserSkills from skillService', () => {
        expect(skillService.getUserSkills).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(skills, message.SkillInfo);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('sendVerificationInvite', () => {
    describe('When sendVerificationInvite is called', () => {
      let sendInvitePayload: SkillInviteDto;
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;

      beforeEach(async () => {
        skillRes = await controller.sendVerificationInvite(
          sendInvitePayload,
          user,
        );
      });

      it('it should call addSkills from skillService', () => {
        expect(skillService.sendVerificationEmail).toBeCalledWith(
          user,
          sendInvitePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.SkillInvite);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('getSkillsQuestion', () => {
    describe('When getSkillsQuestion is called', () => {
      let verifictaionId: string;
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;
      let questions: VerificationQuestionListDto;

      beforeEach(async () => {
        skillRes = await controller.getSkillsQuestion(verifictaionId, user);
      });

      it('it should call getSkillVerificationQuestion from skillService', () => {
        expect(skillService.getSkillVerificationQuestion).toBeCalledWith(
          verifictaionId,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(questions, message.SkillQuestion);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyQuestionsAnswer', () => {
    describe('When verifyQuestionsAnswer is called', () => {
      let verifyPayload: VerifySkillDto;
      const user: UserDto = userMockData;
      let skillRes: HttpResponse;

      beforeEach(async () => {
        skillRes = await controller.verifyQuestionsAnswer(verifyPayload, user);
      });

      it('it should call addSkills from skillService', () => {
        expect(skillService.verifyQuestionsAnswer).toBeCalledWith(
          user,
          verifyPayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.Verified);
        expect(skillRes).toStrictEqual(result);
      });
    });
  });
});
