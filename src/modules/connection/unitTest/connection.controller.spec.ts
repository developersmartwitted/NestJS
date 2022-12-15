import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { ConnectionController } from '../connection.controller';
import { ConnectionService } from '../connection.service';
import { SendConnectionInviteDto } from '../dto/payload/SendConnectionInviteDto';
import { UserEntity } from '../../user/entities/user.entity';
import { ConnectionListDto } from '../dto/response/ConnectionListDto';
import { RevokeConnectionDto } from '../dto/payload/RevokeConnectionDto';

jest.mock('../connection.service');

describe('ConnectionController', () => {
  let controller: ConnectionController;
  let connectionService: ConnectionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ConnectionController],
      providers: [ConnectionService],
    }).compile();

    controller = moduleRef.get<ConnectionController>(ConnectionController);
    connectionService = moduleRef.get<ConnectionService>(ConnectionService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendConnectionInvite', () => {
    describe('When sendConnectionInvite is called', () => {
      let inviteConnection: SendConnectionInviteDto;
      let user: UserEntity;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.sendConnectionInvite(
          user,
          inviteConnection,
        );
      });

      it('it should call sendConnectionInvite from connectionService', () => {
        expect(connectionService.sendConnectionInvite).toBeCalledWith(
          inviteConnection,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.SentConnection);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('acceptConnectionInvite', () => {
    describe('When acceptConnectionInvite is called', () => {
      let inviteConnection: { id: string };
      let user: UserEntity;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.acceptConnectionInvite(
          user,
          inviteConnection,
        );
      });

      it('it should call acceptConnectionInvite from connectionService', () => {
        expect(connectionService.acceptConnectionInvite).toBeCalledWith(
          inviteConnection,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.AcceptConnection);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('getUserConnection', () => {
    describe('When getUserConnection is called', () => {
      let connections: ConnectionListDto;
      let user: UserEntity;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.getUserConnection(user);
      });

      it('it should call sendConnectionInvite from connectionService', () => {
        expect(connectionService.getConnections).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(connections, message.ConnectionInfo);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('revokeConnection', () => {
    describe('When revokeConnection is called', () => {
      let connections: ConnectionListDto;
      let user: UserEntity;
      let connectionRes: HttpResponse;
      let payload: RevokeConnectionDto;

      beforeEach(async () => {
        connectionRes = await controller.revokeConnection(user, payload);
      });

      it('it should call revokeConnection from connectionService', () => {
        expect(connectionService.revokeConnection).toBeCalledWith(
          user,
          payload,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(connections, message.ConnectionInfo);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });
});
