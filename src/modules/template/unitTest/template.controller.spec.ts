import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { TemplateController } from '../template.controller';
import { TemplateService } from '../template.service';
import { AddTemplateDto } from '../dto/payload/AddTemplateDto';
import { UpdateTemplateDto } from '../dto/payload/UpdateTemplateDto';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { TemplateDto } from '../dto/TemplateDto';
import { DeleteTemplateDto } from '../dto/payload/DeleteTemplateDto';
import { TemplateInfoDto } from '../dto/response/TemplateInfoDto';

jest.mock('../template.service');

describe('TemplateController', () => {
  let controller: TemplateController;
  let templateService: TemplateService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [TemplateController],
      providers: [TemplateService],
    }).compile();

    controller = moduleRef.get<TemplateController>(TemplateController);
    templateService = moduleRef.get<TemplateService>(TemplateService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewTemplate', () => {
    describe('When addNewTemplate is called', () => {
      let templateRes: HttpResponse;
      let templatePayload: AddTemplateDto;
      let user: UserDto;

      beforeEach(async () => {
        templateRes = await controller.addNewTemplate(templatePayload, user);
      });

      it('it should call addOrDraftNewTemplate from templateService', () => {
        expect(templateService.addOrDraftNewTemplate).toBeCalledWith(
          templatePayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.AddedTemplate);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('publishTemplates', () => {
    describe('When publishTemplates is called', () => {
      let templateRes: HttpResponse;
      let template: { templateIds: string[] };

      beforeEach(async () => {
        templateRes = await controller.publishTemplates(template);
      });

      it('it should call publishTemplates from templateService', () => {
        expect(templateService.publishTemplates).toBeCalledWith(template);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.PublishTemplate);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('updateTemplate', () => {
    describe('When updateTemplate is called', () => {
      let templateRes: HttpResponse;
      let templatePayload: UpdateTemplateDto;

      beforeEach(async () => {
        templateRes = await controller.updateTemplate(templatePayload);
      });

      it('it should call UpdatedTemplate from templateService', () => {
        expect(templateService.updateTemplate).toBeCalledWith(templatePayload);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.UpdatedTemplate);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('getTemplateList', () => {
    describe('When getTemplateList is called', () => {
      let templateRes: HttpResponse;
      let filterDto: FilterDto;
      let templateList: TemplateDto;

      beforeEach(async () => {
        templateRes = await controller.getTemplateList(filterDto);
      });

      it('it should call getTemplateList from templateService', () => {
        expect(templateService.getTemplateList).toBeCalledWith(filterDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(templateList, message.TemplateList);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('getTemplateInfoByTemplateIId', () => {
    describe('When getTemplateInfoByTemplateIId is called', () => {
      let templateRes: HttpResponse;
      let templateId: string;
      let templateList: TemplateDto;

      beforeEach(async () => {
        templateRes = await controller.getTemplateInfoByTemplateIId(templateId);
      });

      it('it should call getTemplateInfoByTemplateId from templateService', () => {
        expect(templateService.getTemplateInfoByTemplateId).toBeCalledWith(
          templateId,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(templateList, message.TemplateInfo);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteTempalte', () => {
    describe('When deleteTempalte is called', () => {
      let templateRes: HttpResponse;
      let payload: DeleteTemplateDto;

      beforeEach(async () => {
        templateRes = await controller.deleteTempalte(payload);
      });

      it('it should call deleteTempalte from templateService', () => {
        expect(templateService.deleteTempalte).toBeCalledWith(payload);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TemplateInfo);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });

  describe('getTemplateInfoForSlug', () => {
    describe('When getTemplateInfoForSlug is called', () => {
      let templateRes: HttpResponse;
      let slug: string;
      let templateList: TemplateInfoDto;

      beforeEach(async () => {
        templateRes = await controller.getTemplateInfoForSlug(slug);
      });

      it('it should call deleteTempalte from templateService', () => {
        expect(templateService.getTemplateInfoForSlug).toBeCalledWith(slug);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(templateList, message.TemplateInfo);
        expect(templateRes).toStrictEqual(result);
      });
    });
  });
});
