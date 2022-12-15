import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { TeamController } from '../team.controller';
import { TeamService } from '../team.service';
import { AddTeamDto } from '../dto/payload/AddTeamDto';
import { UserEntity } from '../../user/entities/user.entity';
import { UpdateTeamDto } from '../dto/payload/UpdateTeamDto';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { UserDto } from '../../user/dto/UserDto';
import { TeamListDto } from '../dto/response/TeamListDto';
import { userMockData } from '../../user/unitTest/mockData/user.service.mockdata';
import { SendTeamInviteDto } from '../dto/payload/SendTeamInviteDto';
import { DeleteTeamMemberDto } from '../dto/payload/DeleteTeamMemberDto';

jest.mock('../team.service');

describe('TeamController', () => {
  let controller: TeamController;
  let teamService: TeamService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [TeamController],
      providers: [TeamService],
    }).compile();

    controller = moduleRef.get<TeamController>(TeamController);
    teamService = moduleRef.get<TeamService>(TeamService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewTeam', () => {
    describe('When createNewTeam is called', () => {
      let teamRes: HttpResponse;
      let addTeamDto: AddTeamDto;
      let user: UserEntity;

      beforeEach(async () => {
        teamRes = await controller.createNewTeam(user, addTeamDto);
      });

      it('it should call createNewTeam from teamService', () => {
        expect(teamService.createNewTeam).toBeCalledWith(addTeamDto, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TeamAdded);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('updateTeam', () => {
    describe('When updateTeam is called', () => {
      let teamRes: HttpResponse;
      let updateTeamDto: UpdateTeamDto;

      beforeEach(async () => {
        teamRes = await controller.updateTeam(updateTeamDto);
      });

      it('it should call updateTeamInfo from teamService', () => {
        expect(teamService.updateTeamInfo).toBeCalledWith(updateTeamDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TeamUpdated);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('getTeamListForUser', () => {
    describe('When getTeamListForUser is called', () => {
      let teamRes: HttpResponse;
      const user: UserDto = userMockData;
      let filterDto: FilterDto;
      let teamList: TeamListDto;

      beforeEach(async () => {
        teamRes = await controller.getTeamListForUser(user, filterDto);
      });

      it('it should call getTeamsCreatedByUser from teamService', () => {
        expect(teamService.getTeamsCreatedByUser).toBeCalledWith(
          user?.id,
          filterDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(teamList, message.TeamInfo);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('getTeamInfo', () => {
    describe('When getTeamInfo is called', () => {
      let teamRes: HttpResponse;
      const user: UserDto = userMockData;
      let teamId: string;
      let teamList: TeamListDto;

      beforeEach(async () => {
        teamRes = await controller.getTeamInfo(user, teamId);
      });

      it('it should call getTeamsByTeamId from teamService', () => {
        expect(teamService.getTeamsByTeamId).toBeCalledWith(user?.id, teamId);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(teamList, message.TeamInfo);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteTeam', () => {
    describe('When deleteTeam is called', () => {
      let teamRes: HttpResponse;
      const team: { teamId: string } = { teamId: 'somrandomuuid' };

      beforeEach(async () => {
        teamRes = await controller.deleteTeam(team);
      });

      it('it should call deleteTeam from teamService', () => {
        expect(teamService.deleteTeam).toBeCalledWith(team.teamId);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TeamInfo);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteTeamMember', () => {
    describe('When deleteTeamMember is called', () => {
      let teamRes: HttpResponse;
      let team: DeleteTeamMemberDto;

      beforeEach(async () => {
        teamRes = await controller.deleteTeamMember(team);
      });

      it('it should call deleteTeamMember from teamService', () => {
        expect(teamService.deleteTeamMember).toBeCalledWith(team);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.MemberDeleted);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('sendInvitationToExtenamUser', () => {
    describe('When sendInvitationToExtenamUser is called', () => {
      let teamRes: HttpResponse;
      let user: UserEntity;
      let invitePayload: SendTeamInviteDto;

      beforeEach(async () => {
        teamRes = await controller.sendInvitationToExtenamUser(
          user,
          invitePayload,
        );
      });

      it('it should call sendInvitationToUser from teamService', () => {
        expect(teamService.sendInvitationToUser).toBeCalledWith(
          invitePayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TeamInvite);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });

  describe('acceptInvite', () => {
    describe('When acceptInvite is called', () => {
      let teamRes: HttpResponse;
      let user: UserEntity;
      let teamInviteDto: { id: string };

      beforeEach(async () => {
        teamRes = await controller.acceptInvite(teamInviteDto, user);
      });

      it('it should call acceptTeamInvite from teamService', () => {
        expect(teamService.acceptTeamInvite).toBeCalledWith(
          teamInviteDto,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.TeamInviteAccept);
        expect(teamRes).toStrictEqual(result);
      });
    });
  });
});
