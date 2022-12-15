import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { WalletService } from '../wallet.service';
import { WalletController } from '../wallet.controller';
import { UserDto } from '../../user/dto/UserDto';
import { WalletDto } from '../dto/WalletDto';

jest.mock('../wallet.service');

describe('WalletController', () => {
  let controller: WalletController;
  let wallerService: WalletService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [WalletController],
      providers: [WalletService],
    }).compile();

    controller = moduleRef.get<WalletController>(WalletController);
    wallerService = moduleRef.get<WalletService>(WalletService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWalletInfo', () => {
    describe('When getWalletInfo is called', () => {
      let walletInfo: HttpResponse;
      let user: UserDto;
      let mockwalletInfo: WalletDto;

      beforeEach(async () => {
        walletInfo = await controller.getWalletInfo(user);
      });

      it('it should call getWalletInfo from WallerService', () => {
        expect(wallerService.getWalletInfo).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(mockwalletInfo, message.WalletInfo);
        expect(walletInfo).toStrictEqual(result);
      });
    });
  });
});
