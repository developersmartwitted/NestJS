import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { EducationController } from '../education.cotroller';
import { EducationService } from '../education.service';
import { AddEducationDto } from '../dto/payload/AddEducationDto';
import { UpdateEducationDto } from '../dto/payload/UpdateEducationDto';
import { DeleteEducationDto } from '../dto/payload/DeleteEducationDto';
import { EducationDto } from '../dto/EducationDto';
import { AddCertificateDto } from '../dto/payload/AddCertificateDto';
import { UpdateCertificateDto } from '../dto/payload/UpdateCertificateDto';
import { DeleteCertificateDto } from '../dto/payload/DeleteCertificateDto';
import { CertificationDto } from '../dto/CertificationDto';

jest.mock('../education.service');

describe('EducationController', () => {
  let controller: EducationController;
  let educationService: EducationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [EducationController],
      providers: [EducationService],
    }).compile();

    controller = moduleRef.get<EducationController>(EducationController);
    educationService = moduleRef.get<EducationService>(EducationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewEducation', () => {
    describe('When addNewEducation is called', () => {
      let educationPayloadDto: AddEducationDto;
      let user: UserDto;
      let educationRes: HttpResponse;

      beforeEach(async () => {
        educationRes = await controller.addNewEducation(
          educationPayloadDto,
          user,
        );
      });

      it('it should call addEmployment from educationService', () => {
        expect(educationService.addNewEducation).toBeCalledWith(
          educationPayloadDto,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EducationAdded);
        expect(educationRes).toStrictEqual(result);
      });
    });
  });

  describe('updateEducation', () => {
    describe('When updateEducation is called', () => {
      let educationPayloadDto: UpdateEducationDto;
      let user: UserDto;
      let educationRes: HttpResponse;

      beforeEach(async () => {
        educationRes = await controller.updateEducation(
          educationPayloadDto,
          user,
        );
      });

      it('it should call updateEducationDetail from educationService', () => {
        expect(educationService.updateEducationDetail).toBeCalledWith(
          user,
          educationPayloadDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EducationUpdated);
        expect(educationRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteEducationDetail', () => {
    describe('When deleteEducationDetail is called', () => {
      let educationPayloadDto: DeleteEducationDto;
      let user: UserDto;
      let educationRes: HttpResponse;

      beforeEach(async () => {
        educationRes = await controller.deleteEducationDetail(
          educationPayloadDto,
          user,
        );
      });

      it('it should call deleteEducationInfo from educationService', () => {
        expect(educationService.deleteEducationInfo).toBeCalledWith(
          user,
          educationPayloadDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.EducationDeleted);
        expect(educationRes).toStrictEqual(result);
      });
    });
  });

  describe('getEducation', () => {
    describe('When getEducation is called', () => {
      let educationInfo: EducationDto;
      let user: UserDto;
      let educationRes: HttpResponse;

      beforeEach(async () => {
        educationRes = await controller.getEducation(user);
      });

      it('it should call getEducationInfo from educationService', () => {
        expect(educationService.getEducationInfo).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(educationInfo, message.EducationInfo);
        expect(educationRes).toStrictEqual(result);
      });
    });
  });

  describe('getEducationById', () => {
    describe('When getEducationById is called', () => {
      let educationInfo: EducationDto;
      let user: UserDto;
      let educationId: string;
      let educationRes: HttpResponse;

      beforeEach(async () => {
        educationRes = await controller.getEducationById(user, educationId);
      });

      it('it should call getEducationById from educationService', () => {
        expect(educationService.getEducationById).toBeCalledWith(
          user,
          educationId,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(educationInfo, message.EducationInfo);
        expect(educationRes).toStrictEqual(result);
      });
    });
  });

  describe('addNewCertification', () => {
    describe('When addNewCertification is called', () => {
      let certificatePayload: AddCertificateDto;
      let user: UserDto;
      let certificateRes: HttpResponse;

      beforeEach(async () => {
        certificateRes = await controller.addNewCertification(
          certificatePayload,
          user,
        );
      });

      it('it should call addNewCertification from educationService', () => {
        expect(educationService.addNewCertification).toBeCalledWith(
          certificatePayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.CertificateAdded);
        expect(certificateRes).toStrictEqual(result);
      });
    });
  });

  describe('updateCertificate', () => {
    describe('When updateCertificate is called', () => {
      let certificatePayload: UpdateCertificateDto;
      let user: UserDto;
      let certificateRes: HttpResponse;

      beforeEach(async () => {
        certificateRes = await controller.updateCertificate(
          certificatePayload,
          user,
        );
      });

      it('it should call updateCertificateDetail from educationService', () => {
        expect(educationService.updateCertificateDetail).toBeCalledWith(
          user,
          certificatePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.CertificateUpdated,
        );
        expect(certificateRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteCertificateDetail', () => {
    describe('When deleteCertificateDetail is called', () => {
      let deletePayloadDto: DeleteCertificateDto;
      let user: UserDto;
      let certificateRes: HttpResponse;

      beforeEach(async () => {
        certificateRes = await controller.deleteCertificateDetail(
          deletePayloadDto,
          user,
        );
      });

      it('it should call deleteCertificationInfo from educationService', () => {
        expect(educationService.deleteCertificationInfo).toBeCalledWith(
          user,
          deletePayloadDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.CertificateDeleted,
        );
        expect(certificateRes).toStrictEqual(result);
      });
    });
  });

  describe('getCertificates', () => {
    describe('When getCertificates is called', () => {
      let certificateInfo: CertificationDto;
      let user: UserDto;
      let certificateRes: HttpResponse;

      beforeEach(async () => {
        certificateRes = await controller.getCertificates(user);
      });

      it('it should call getCertificateInfo from educationService', () => {
        expect(educationService.getCertificateInfo).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          certificateInfo,
          message.CertificateInfo,
        );
        expect(certificateRes).toStrictEqual(result);
      });
    });
  });

  describe('getCertificateById', () => {
    describe('When getCertificateById is called', () => {
      let certificateInfo: CertificationDto;
      let user: UserDto;
      let certificateId: string;
      let certificateRes: HttpResponse;

      beforeEach(async () => {
        certificateRes = await controller.getCertificateById(
          user,
          certificateId,
        );
      });

      it('it should call getEducationById from educationService', () => {
        expect(educationService.getCertificateById).toBeCalledWith(
          user,
          certificateId,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          certificateInfo,
          message.CertificateInfo,
        );
        expect(certificateRes).toStrictEqual(result);
      });
    });
  });
});
