import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import moment from 'moment';
import * as crypto from 'crypto';

import { ConfigService } from '../../shared/config/config.service';
import * as message from '../../shared/http/message.http';
import { LoggerService } from '../../shared/providers/logger.service';
import { UserDto } from '../user/dto/UserDto';
import { CreateTopicDto } from './dto/payload/createTopicDto';
import { PostReplyDto } from './dto/payload/PostReplyDto';
import { TopicFilterDto } from './dto/payload/TopicFilterDto';
import { CommunityCategoryDto } from './dto/response/CommunityCategoryDto';
import { CommunityTagDto } from './dto/response/CommunityTagDto';
import { PostResponseDto } from './dto/response/PostResponseDto';
import { RepliesDto } from './dto/response/RepliesDto';
import { SuggestedTopicDto } from './dto/response/SuggestedTopicDto';
import { TopicInfoDto } from './dto/response/TopicInfoDto';
import { TopicListDto } from './dto/response/TopicListDto';
import { DiscourseService } from './providers/discourse.api';
import { DiscourseRepository } from './repositories/discourse.repository';

@Injectable()
export class CommunityService {
  constructor(
    private discourseService: DiscourseService,
    private discourseRepository: DiscourseRepository,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  /**
   * @description Called from all function within this service to fetch the discourse userName
   * @param user Logged in user info
   * @returns Discourse userName of the user, else error is thrown.
   * @author Samsheer Alam
   */
  async getDiscourseUserName(user: UserDto): Promise<string> {
    try {
      const discourseInfo = await this.discourseRepository.findOne({ user });
      if (discourseInfo === undefined) {
        throw new BadRequestException('User does not exist in community.');
      }
      return discourseInfo.username;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetchs tags from discourse and sends it to FE to shown under tags dropdown in topics list page
   * @returns CommunityTagDto {tagSlug, tagName}
   * @author Samsheer Alam
   */
  async getListOfTags(): Promise<CommunityTagDto[]> {
    try {
      const data = await this.discourseService.getTagsList();
      return data?.tags.map((item: any) => {
        return {
          tagSlug: item?.id === undefined ? null : item?.id,
          tagName:
            item?.name === undefined ? null : item?.name.replace(/-/g, ' '),
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @deescription Fetchs the list of categories to shown on topics list page
   * @param user Logged in userInfo
   * @returns CommunityCategoryDto {categoryId, categorySlug and categoryName}
   * @author Samsheer Alam
   */
  async getListOfCategories(user: UserDto): Promise<CommunityCategoryDto[]> {
    try {
      const userName = await this.getDiscourseUserName(user);
      const data = await this.discourseService.getListOfCategories(userName);
      return data?.category_list?.categories.map((item: any) => {
        return {
          categoryId: item?.id === undefined ? null : item?.id,
          categorySlug: item?.slug === undefined ? '' : item?.slug,
          categoryName: item?.name === undefined ? '' : item?.name,
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Creates a new topic from user
   * @param createTopicPayload Data which needs from FE to create a topic
   * @author Samsheer Alam
   */
  async createNewTopic(
    createTopicPayload: CreateTopicDto,
    user: UserDto,
  ): Promise<void> {
    try {
      const topicPaylaod = {
        title: createTopicPayload.title,
        raw: createTopicPayload.raw,
        unlist_topic: false,
        category: createTopicPayload.categoryId,
        nested_post: true,
        tags: createTopicPayload.tags,
      };
      const userName = await this.getDiscourseUserName(user);
      await this.discourseService.createTopicOrPostOrReply(
        topicPaylaod,
        userName,
      );
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetchs the list of latest topics based on given filter
   * @param filter TopicFilterDto data
   * @param user Logged in user info
   * @returns Topics list with pagination
   * @author Samsheer Alam
   */
  async getTopics(
    filter: TopicFilterDto,
    user: UserDto,
  ): Promise<{
    pagination: { perPage: number; nextPage: boolean; currentPage: number };
    topics: TopicListDto[];
  }> {
    try {
      const userName = await this.getDiscourseUserName(user);
      const data = await this.discourseService.getTopics(filter, userName);

      const topics = data?.['topic_list']?.topics.map((item: any) => {
        return {
          topicId: item?.id || '',
          title: item?.title || '',
          replyCount:
            item?.posts_count === undefined ? '' : item?.posts_count - 1,
          likeCount: item?.reply_count || 0,
          views: item?.views || 0,
          createdAt: item?.created_at || '',
          lastPostedAt: item?.last_posted_at || '',
        };
      });

      return {
        pagination: {
          perPage:
            data?.['topic_list']?.per_page === undefined
              ? 30
              : data?.['topic_list']?.per_page,
          nextPage:
            data?.['topic_list']?.more_topics_url === undefined ? false : true,
          currentPage: filter?.page === undefined ? 0 : Number(filter?.page),
        },
        topics,
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of posts and suggested topic for the given topic id.
   * @param topicId Id of the topic for which post and suggested info is fetched
   * @param user Logged in userInfo
   * @returns {TopicInfoDto, posts, suggestedTopics}
   * @author Samsheer Alam
   */
  async getTopicDetails(
    topicId: number,
    user: UserDto,
  ): Promise<{
    topicInfo: TopicInfoDto;
    posts: PostResponseDto[];
    suggestedTopics: SuggestedTopicDto[];
  }> {
    try {
      const userName = await this.getDiscourseUserName(user);
      const data = await this.discourseService.getTopicById(topicId, userName);
      const topicInfo = await this.getTopicInfo(data);
      const suggestedTopics = await this.getSuggestedTopics(data);
      const posts = await this.getTopicsPosts(data, userName);

      return { topicInfo, posts, suggestedTopics };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "getTopicDetails" function to arrange and filter the post list of the topic
   * @param data Data from discourse getTopicById api
   * @param userName Loged in user's discourse userName
   * @returns PostResponseDto data
   * @author Samsheer Alam
   */
  async getTopicsPosts(data, userName: string): Promise<PostResponseDto[]> {
    return data?.post_stream?.posts?.map((item) => {
      const actionSummery =
        item?.actions_summary !== undefined && item?.actions_summary?.length > 0
          ? item?.actions_summary
          : [];
      const likedInfo = actionSummery.filter(
        (i) => i?.id === 2 && i?.count > 0,
      );
      return {
        postId: item?.id || '',
        topicId: item?.topic_id || '',
        post: item?.cooked || '',
        raw: item?.raw || '',
        replyCount: item?.reply_count || 0,
        userName: item?.display_username || '',
        postNumber: item?.post_number || '',
        replyToPostNumber:
          item?.reply_to_post_number === undefined ||
          item?.reply_to_post_number === null
            ? null
            : data?.post_stream?.posts[item?.reply_to_post_number - 1]?.id,
        replyToUserName: item?.reply_to_user?.username || null,
        showLike:
          item?.username === undefined
            ? true
            : item?.username === userName
            ? false
            : true,
        liked: likedInfo.length > 0 ? true : false,
        createdAt: item?.created_at || null,
      };
    });
  }

  /**
   * @description Called from "getTopicDetails" function to filter and fetch topic info
   * @param data Data from discourse getTopicById api
   * @returns TopicInfoDto data
   * @author Samsheer Alam
   */
  async getTopicInfo(data): Promise<TopicInfoDto> {
    return {
      title: data?.title || '',
      lastPostedAt: data?.last_posted_at || '',
      lastPostedBy: data?.details?.last_poster?.username || '',
      replyCount:
        data?.post_stream.posts === undefined
          ? 0
          : data?.post_stream.posts.length - 1,
      viewCount: data?.views || 0,
      userCount:
        data?.details?.participants === undefined
          ? 0
          : data?.details?.participants.length,
      likeCount: data?.like_count || 0,
      createdAt: data?.created_at || '',
    };
  }

  /**
   * @description Called from "getTopicDetails" function to filter and arrange suggested topics list
   * @param data Data from discourse getTopicById api
   * @returns Array of SuggestedTopicDto data
   * @author Samsheer Alam
   */
  async getSuggestedTopics(data): Promise<SuggestedTopicDto[]> {
    return data?.suggested_topics.map((item) => {
      return {
        topicId: item?.id || '',
        title: item?.title || '',
        replyCount: item?.reply_count || 0,
        views: item?.views || 0,
        likeCount: item?.like_count || 0,
        createdAt: item?.created_at || '',
        lastPostedAt: item?.last_posted_at || '',
      };
    });
  }

  /**
   * @description Fetches the list of replies for the given post id
   * @param postId Id of the post for which replies needs to be fetched
   * @param user Logged in user info
   * @returns RepliesDto data
   * @author Samsheer Alam
   */
  async getPostReplyDetails(
    postId: number,
    user: UserDto,
  ): Promise<RepliesDto[]> {
    try {
      const userName = await this.getDiscourseUserName(user);
      const data = await this.discourseService.getRepliesForPostId(
        postId,
        userName,
      );
      return data?.map((item: any) => {
        return {
          postId: item?.id || null,
          topicId: item?.topic_id || null,
          replyText: item?.cooked || '',
          userName: item?.display_username || '',
          replyToUserName: item?.reply_to_user?.name || '',
        };
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Like the given post id on discourse server
   * @param postId id of the post for which like request needs to be sent
   * @param user Logged in user info
   * @author Samsheer Alam
   */
  async likeAPost(postId: number, user: UserDto): Promise<void> {
    try {
      const userName = await this.getDiscourseUserName(user);
      const payload = {
        id: postId,
        post_action_type_id: 2, //2 defines the like action type in discourse
        flag_topic: false,
      };
      await this.discourseService.likePost(payload, userName);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function which is called to reply to the post
   * @param replyPayload PostReplyDto data
   * @param user Logged in user info
   */
  async replyToPost(replyPayload: PostReplyDto, user: UserDto): Promise<void> {
    try {
      const payload = {
        raw: replyPayload.raw,
        topic_id: replyPayload.topicId,
        reply_to_post_number: replyPayload.replyToPostNumber,
        nested_post: true,
      };
      const userName = await this.getDiscourseUserName(user);
      await this.discourseService.createTopicOrPostOrReply(payload, userName);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "authServie" from registeration function to create an account in discourse
   * @param userInfo Newly registered info
   * @returns DiscourseDto if successfull or else if there is any error void is returned
   * Here catch does not throw error because this function is called from auth service while registering a new user.
   * This function is called in promise, this should not impact on FE, so even if there is any error data is stored in discourse table as inactive
   * @author Samsheer Alam
   */
  async createDiscourseUser(
    userInfo: UserDto,
  ): Promise<{ message: string; status: boolean }> {
    try {
      const checkIfAlreadyExist = await this.discourseRepository.findOne({
        user: userInfo,
      });

      if (checkIfAlreadyExist !== undefined) {
        return {
          message: 'User already registered in community.',
          status: false,
        };
      }
      const currentTimeStamp = moment().unix();
      const uniqueUsername = `${userInfo.firstName}${currentTimeStamp}`;
      const discoursePassword = `Panton@${currentTimeStamp}`;
      const payload = {
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email,
        password: discoursePassword,
        username: uniqueUsername,
        active: true,
        approved: true,
      };
      const data = await this.discourseService.createDiscourseUser(payload);

      if (data?.success) {
        const discourseData = {
          ...payload,
          user: userInfo,
          password: await this.encryptString(discoursePassword),
          discourseId: data?.user_id,
          active: data?.active,
          approved: true,
        };
        const discourseRef = this.discourseRepository.create(discourseData);
        await this.discourseRepository.save(discourseRef);
        return { message: '', status: true };
      }
      return { message: data?.message, status: false };
    } catch (error) {
      this.logger.error(error?.message, error);
      return { message: error?.message, status: false };
    }
  }

  /**
   * @description Encrypts the given string
   * @param value String which needs to be encrypted
   * @returns encrypted text
   * @author Samsheer Alam
   */
  async encryptString(value: string) {
    const cipher = crypto.createCipheriv(
      this.configService.get('ENCRYPTION_ALGORITHM'),
      Buffer.from(this.configService.get('ENCRYPTION_SECURITY_KEY'), 'hex'),
      Buffer.from(this.configService.get('ENCRYPTION_INIT_VECTOR'), 'hex'),
    );
    let encryptedData = cipher.update(value, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
  }

  /**
   * @description Decrypts the given string
   * @param value String which needs to be decrypted
   * @returns decrypted text
   * @author Samsheer Alam
   */
  async decryptString(value: string) {
    const decipher = crypto.createDecipheriv(
      this.configService.get('ENCRYPTION_ALGORITHM'),
      Buffer.from(this.configService.get('ENCRYPTION_SECURITY_KEY'), 'hex'),
      Buffer.from(this.configService.get('ENCRYPTION_INIT_VECTOR'), 'hex'),
    );
    let decryptedData = decipher.update(value, 'hex', 'utf-8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  }
}
