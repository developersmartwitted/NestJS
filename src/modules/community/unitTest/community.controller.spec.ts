import { Test } from '@nestjs/testing';

import HttpOkResponse from '../../../shared/http/ok.http';
import * as message from '../../../shared/http/message.http';

import HttpResponse from '../../../shared/http/response.http';
import { CommunityController } from '../community.controller';
import { CommunityService } from '../community.service';
import { UserDto } from '../../user/dto/UserDto';
import { CommunityTagDto } from '../dto/response/CommunityTagDto';
import { CommunityCategoryDto } from '../dto/response/CommunityCategoryDto';
import { CreateTopicDto } from '../dto/payload/createTopicDto';
import { TopicInfoDto } from '../dto/response/TopicInfoDto';
import { PostResponseDto } from '../dto/response/PostResponseDto';
import { SuggestedTopicDto } from '../dto/response/SuggestedTopicDto';
import { TopicListDto } from '../dto/response/TopicListDto';
import { TopicFilterDto } from '../dto/payload/TopicFilterDto';
import { RepliesDto } from '../dto/response/RepliesDto';
import { PostReplyDto } from '../dto/payload/PostReplyDto';

jest.mock('../community.service');

describe('CommunityController', () => {
  let controller: CommunityController;
  let communityService: CommunityService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [CommunityController],
      providers: [CommunityService],
    }).compile();

    controller = moduleRef.get<CommunityController>(CommunityController);
    communityService = moduleRef.get<CommunityService>(CommunityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewUser', () => {
    describe('When createNewUser is called', () => {
      let user: UserDto;
      let communityRes: HttpResponse;

      beforeEach(async () => {
        jest
          .spyOn(controller, 'createNewUser')
          .mockImplementation(async () => communityRes);
        communityRes = await controller.createNewUser(user);
        expect(controller.createNewUser).toHaveBeenCalled();
      });

      it('it should return', async () => {
        const communityResult: { message: string; status: boolean } = {
          message: message.ComUserCreated,
          status: true,
        };
        jest
          .spyOn(communityService, 'createDiscourseUser')
          .mockImplementation(async () => communityResult);
        await communityService.createDiscourseUser(user);
        expect(communityService.createDiscourseUser).toBeCalledWith(user);
      });
    });
  });

  describe('getTags', () => {
    describe('When getTags is called', () => {
      let communityRes: HttpResponse;
      let tags: CommunityTagDto[];

      beforeEach(async () => {
        communityRes = await controller.getTags();
      });

      it('it should call getListOfTags from communityService', () => {
        expect(communityService.getListOfTags).toHaveBeenCalled();
      });

      it('it should return', () => {
        const result = new HttpOkResponse(tags, message.ComTag);
        expect(communityRes).toStrictEqual(result);
      });
    });
  });

  describe('getCategories', () => {
    describe('When getCategories is called', () => {
      let categories: CommunityCategoryDto[];
      let user: UserDto;
      let communityRes: HttpResponse;

      beforeEach(async () => {
        communityRes = await controller.getCategories(user);
      });

      it('it should call getListOfCategories from communityService', () => {
        expect(communityService.getListOfCategories).toBeCalledWith(user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(categories, message.ComCategory);
        expect(communityRes).toStrictEqual(result);
      });
    });
  });

  describe('getPosts', () => {
    describe('When getPosts is called', () => {
      let createTopicPayload: CreateTopicDto;
      let user: UserDto;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.getPosts(createTopicPayload, user);
      });

      it('it should call createNewTopic from communityService', () => {
        expect(communityService.createNewTopic).toBeCalledWith(
          createTopicPayload,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ComTopicCreated);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('getTopics', () => {
    describe('When getTopics is called', () => {
      let filter: TopicFilterDto;
      let user: UserDto;
      let connectionRes: HttpResponse;
      let responseData: {
        pagination: { perPage: number; nextPage: boolean; currentPage: number };
        topics: TopicListDto[];
      };
      beforeEach(async () => {
        connectionRes = await controller.getTopics(filter, user);
      });

      it('it should call getTopics from communityService', () => {
        expect(communityService.getTopics).toBeCalledWith(filter, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(responseData, message.ComTopics);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('getTopicDetails', () => {
    describe('When getTopicDetails is called', () => {
      let topicId: number;
      let user: UserDto;
      let connectionRes: HttpResponse;
      let responseData: {
        topicInfo: TopicInfoDto;
        posts: PostResponseDto[];
        suggestedTopics: SuggestedTopicDto[];
      };
      beforeEach(async () => {
        connectionRes = await controller.getTopicDetails(topicId, user);
      });

      it('it should call getTopicDetails from communityService', () => {
        expect(communityService.getTopicDetails).toBeCalledWith(topicId, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(responseData, message.ComTopics);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('getReplies', () => {
    describe('When getReplies is called', () => {
      let postId: number;
      let user: UserDto;
      let connectionRes: HttpResponse;
      let responseData: RepliesDto[];
      beforeEach(async () => {
        connectionRes = await controller.getReplies(postId, user);
      });

      it('it should call getPostReplyDetails from communityService', () => {
        expect(communityService.getPostReplyDetails).toBeCalledWith(
          postId,
          user,
        );
      });

      it('it should return', () => {
        const result = new HttpOkResponse(responseData, message.ComTopics);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('replyToPost', () => {
    describe('When replyToPost is called', () => {
      let replyPayload: PostReplyDto;
      let user: UserDto;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.replyToPost(replyPayload, user);
      });

      it('it should call replyToPost from communityService', () => {
        expect(communityService.replyToPost).toBeCalledWith(replyPayload, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ComPostReply);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });

  describe('likePost', () => {
    describe('When likePost is called', () => {
      let postId: number;
      let user: UserDto;
      let connectionRes: HttpResponse;

      beforeEach(async () => {
        connectionRes = await controller.likePost(postId, user);
      });

      it('it should call likeAPost from communityService', () => {
        expect(communityService.likeAPost).toBeCalledWith(postId, user);
      });

      it('it should return', () => {
        const result = new HttpOkResponse(undefined, message.ComPostReply);
        expect(connectionRes).toStrictEqual(result);
      });
    });
  });
});
