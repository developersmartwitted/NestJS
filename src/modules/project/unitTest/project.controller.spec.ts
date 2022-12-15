import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { ProjectController } from '../project.controller';
import { ProjectService } from '../project.service';
import { UserDto } from '../../user/dto/UserDto';
import { AddProjectDto } from '../dto/payload/AddProjectDto';
import { UserEntity } from '../..//user/entities/user.entity';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { MyProjectListDto } from '../dto/response/MyProjectListDto';
import { UpdateProjectDto } from '../dto/payload/UpdateProjectDto';
import { ProjectDto } from '../dto/ProjectDto';
import { ProjectMemberDto } from '../dto/response/ProjectMemberDto';
import { RemoveProjectMemberDto } from '../dto/payload/RemoveProjectMemberDto';
import { ApplyProjectDto } from '../dto/payload/ApplyProjectDto';
import { AcceptProjectDto } from '../dto/payload/AcceptProjectDto';
import { UpdateProjectStatusDto } from '../dto/payload/UpdateProjectStatusDto';
import { SendProjectInviteDto } from '../dto/payload/SendProjectInviteDto';

jest.mock('../project.service');

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ProjectController],
      providers: [ProjectService],
    }).compile();

    controller = moduleRef.get<ProjectController>(ProjectController);
    projectService = moduleRef.get<ProjectService>(ProjectService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addNewProject', () => {
    describe('When addNewProject is called', () => {
      let projectRes: HttpResponse;
      let projectPayloadDto: AddProjectDto;
      let user: UserEntity;

      beforeEach(async () => {
        projectRes = await controller.addNewProject(projectPayloadDto, user);
      });

      it('it should call createProject from projectService', () => {
        expect(projectService.createProject).toBeCalledWith(
          projectPayloadDto,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectCreated);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('getProjectBySearch', () => {
    describe('When getProjectBySearch is called', () => {
      let projectRes: HttpResponse;
      let filterDto: FilterDto;
      let user: UserDto;
      let data: MyProjectListDto;

      beforeEach(async () => {
        projectRes = await controller.getProjectBySearch(filterDto, user);
      });

      it('it should call getProjectList from projectService', () => {
        expect(projectService.getProjectList).toBeCalledWith(filterDto, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(data, message.ProjectInfo);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('updateProject', () => {
    describe('When updateProject is called', () => {
      let projectRes: HttpResponse;
      let updateProjectDto: UpdateProjectDto;

      beforeEach(async () => {
        projectRes = await controller.updateProject(updateProjectDto);
      });

      it('it should call updateProject from projectService', () => {
        expect(projectService.updateProject).toBeCalledWith(updateProjectDto);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectUpdated);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('deleteProjects', () => {
    describe('When deleteProjects is called', () => {
      let projectRes: HttpResponse;
      const project: { projectId: string } = { projectId: 'projectid' };

      beforeEach(async () => {
        projectRes = await controller.deleteProjects(project);
      });

      it('it should call deleteProject from projectService', () => {
        expect(projectService.deleteProject).toBeCalledWith(project.projectId);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectDeleted);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('getProjectInfoById', () => {
    describe('When getProjectInfoById is called', () => {
      let projectRes: HttpResponse;
      let data: ProjectDto;
      let projectId: string;

      beforeEach(async () => {
        projectRes = await controller.getProjectInfoById(projectId);
      });

      it('it should call getProjectInfoById from projectService', () => {
        expect(projectService.getProjectInfoById).toBeCalledWith(projectId);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(data, message.ProjectInfo);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('removeProjectMember', () => {
    describe('When removeProjectMember is called', () => {
      let projectRes: HttpResponse;
      let project: RemoveProjectMemberDto;

      beforeEach(async () => {
        projectRes = await controller.removeProjectMember(project);
      });

      it('it should call removeProjectMember from projectService', () => {
        expect(projectService.removeProjectMember).toBeCalledWith(project);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.MemberDeleted);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('getApplicantsList', () => {
    describe('When getApplicantsList is called', () => {
      let projectRes: HttpResponse;
      let data: ProjectMemberDto;
      let projectId: string;
      let filterDto: FilterDto;

      beforeEach(async () => {
        projectRes = await controller.getApplicantsList(projectId, filterDto);
      });

      it('it should call getProjectApplicantList from projectService', () => {
        expect(projectService.getProjectApplicantList).toBeCalledWith(
          projectId,
          filterDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(data, message.ProjectApplicantList);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('applyForProject', () => {
    describe('When applyForProject is called', () => {
      let projectRes: HttpResponse;
      let user: UserEntity;
      let applyProjectDto: ApplyProjectDto;

      beforeEach(async () => {
        projectRes = await controller.applyForProject(user, applyProjectDto);
      });

      it('it should call applyForProject from projectService', () => {
        expect(projectService.applyForProject).toBeCalledWith(
          user,
          applyProjectDto,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectApplied);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('addUserToProject', () => {
    describe('When addUserToProject is called', () => {
      let projectRes: HttpResponse;
      let user: UserEntity;
      let payload: AcceptProjectDto;

      beforeEach(async () => {
        projectRes = await controller.addUserToProject(payload, user);
      });

      it('it should call acceptProjectApplication from projectService', () => {
        expect(projectService.acceptProjectApplication).toBeCalledWith(
          payload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectAccepted);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('updateProjectStatus', () => {
    describe('When updateProjectStatus is called', () => {
      let projectRes: HttpResponse;
      let user: UserEntity;
      let payload: UpdateProjectStatusDto;

      beforeEach(async () => {
        projectRes = await controller.updateProjectStatus(payload, user);
      });

      it('it should call updateProjectStatus from projectService', () => {
        expect(projectService.updateProjectStatus).toBeCalledWith(
          payload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectStatus);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('sendProjectInvite', () => {
    describe('When sendProjectInvite is called', () => {
      let projectRes: HttpResponse;
      let user: UserEntity;
      let projectInviteDto: SendProjectInviteDto;

      beforeEach(async () => {
        projectRes = await controller.sendProjectInvite(projectInviteDto, user);
      });

      it('it should call sendProjectInvite from projectService', () => {
        expect(projectService.sendProjectInvite).toBeCalledWith(
          projectInviteDto,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectInvite);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });

  describe('acceptInvite', () => {
    describe('When acceptInvite is called', () => {
      let projectRes: HttpResponse;
      let user: UserEntity;
      let projectInviteDto: { id: string };

      beforeEach(async () => {
        projectRes = await controller.acceptInvite(projectInviteDto, user);
      });

      it('it should call acceptProjectInvite from projectService', () => {
        expect(projectService.acceptProjectInvite).toBeCalledWith(
          projectInviteDto,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ProjectAccepted);
        expect(projectRes).toStrictEqual(result);
      });
    });
  });
});
