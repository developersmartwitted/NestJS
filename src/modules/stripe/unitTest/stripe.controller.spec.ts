import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { UserDto } from '../../user/dto/UserDto';
import { StripeController } from '../stripe.controller';
import { StripeService } from '../stripe.service';
import { InvoicePayloadDto } from '../dto/payload/InvoicePayloadDto';
import { StripeConnectDto } from '../dto/response/StripeConnectDto';
import { InvoiceDto } from '../dto/InvoiceDto';
import { FilterDto } from 'src/helpers/dto/FilterDto';
import { InvoiceHistoryDto } from '../dto/response/InvoiceHistoryDto';

jest.mock('../stripe.service');

describe('StripeController', () => {
  let controller: StripeController;
  let stripeService: StripeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [StripeController],
      providers: [StripeService],
    }).compile();

    controller = moduleRef.get<StripeController>(StripeController);
    stripeService = moduleRef.get<StripeService>(StripeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewStripeConnect', () => {
    describe('When addNewStripeConnect is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;
      let link: StripeConnectDto;

      beforeEach(async () => {
        stripeRes = await controller.addNewStripeConnect(user);
      });

      it('it should call connectStripe from stripeService', () => {
        expect(stripeService.connectStripe).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(link, message.StripeConnect);
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });

  describe('sendInvoice', () => {
    describe('When sendInvoice is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;
      let invoicePayload: InvoicePayloadDto;
      let invoiceRes: InvoiceDto;

      beforeEach(async () => {
        stripeRes = await controller.sendInvoice(user, invoicePayload);
      });

      it('it should call generateInvoice from stripeService', () => {
        expect(stripeService.generateInvoice).toBeCalledWith(
          user,
          invoicePayload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(invoiceRes, message.InvoiceSent);
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });

  describe('getAccount', () => {
    describe('When getAccount is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;
      let invoiceRes: { accountStatus: boolean };

      beforeEach(async () => {
        stripeRes = await controller.getAccount(user);
      });

      it('it should call getAccountInfo from stripeService', () => {
        expect(stripeService.getAccountInfo).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          invoiceRes,
          message.StripeAccountInfo,
        );
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });

  describe('getInvoices', () => {
    describe('When getInvoices is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;
      let filterDto: FilterDto;
      let invoiceRes: InvoiceHistoryDto;

      beforeEach(async () => {
        stripeRes = await controller.getInvoices(filterDto, user);
      });

      it('it should call getInvoiceHistory from stripeService', () => {
        expect(stripeService.getInvoiceHistory).toBeCalledWith(filterDto, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(invoiceRes, message.InvoiceList);
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });

  describe('verifyInvoice', () => {
    describe('When verifyInvoice is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;
      let invoiceId: string;

      beforeEach(async () => {
        stripeRes = await controller.verifyInvoice(invoiceId, user);
      });

      it('it should call getInvoiceHistory from stripeService', () => {
        expect(stripeService.verifyInvoice).toBeCalledWith(invoiceId, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.InvoiceVerified);
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });

  describe('checkAndUpdateAccountStatus', () => {
    describe('When checkAndUpdateAccountStatus is called', () => {
      let stripeRes: HttpResponse;
      let user: UserDto;

      beforeEach(async () => {
        stripeRes = await controller.checkAndUpdateAccountStatus(user);
      });

      it('it should call getInvoiceHistory from stripeService', () => {
        expect(stripeService.updateAccountStatus).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(
          undefined,
          message.StripeAccStatusUpdated,
        );
        expect(stripeRes).toStrictEqual(result);
      });
    });
  });
});
