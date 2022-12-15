import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';

import { ConfigService } from '../../../shared/config/config.service';
import { LoggerService } from '../../../shared/providers/logger.service';
import * as message from '../../../shared/http/message.http';
import { TopicFilterDto } from '../dto/payload/TopicFilterDto';

@Injectable()
export class DiscourseService {
  constructor(
    private readonly httpService: HttpService,
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  /**
   * @description Called from all function within this service.
   * Sends api request to discourse server and fetches the data from it and returns it.
   * @param options { method, url, payload, userName } data
   * @returns data response from discourse api
   */
  async getDataFromDiscourse(options: {
    method: string;
    url: string;
    payload?: any;
    userName?: string;
  }) {
    const { method, url, payload, userName } = options;
    const apiUserName =
      userName === undefined
        ? this.configService.get('DISCOURSE_USERNAME')
        : userName;
    const headers = {
      headers: { 'Api-Username': apiUserName },
    };
    let axiosParameter: string | any = [];
    switch (method) {
      case 'get':
        axiosParameter = [url, headers];
        break;
      case 'post':
        axiosParameter = [url, payload, headers];
        break;
    }
    try {
      const response: Observable<any> = this.httpService[method](
        ...axiosParameter,
      );
      const result = await lastValueFrom(response);
      return result.data;
    } catch (error) {
      this.logger.error(
        `Error while hitting "${url}" : ${JSON.stringify(payload)}`,
        { error: error?.response?.data },
      );
      throw new BadRequestException(error?.response?.data?.errors[0]);
    }
  }

  /**
   * @description Called from "createDiscourseUser" function in community service.
   * Registers a new user in discourse community.
   * @param payload {name, email, password, username, active, approved}
   * @returns Created  discourse user info
   * Server error is not thrown, because this function is called from registeration api in promise
   */
  async createDiscourseUser(payload: {
    name: string;
    email: string;
    password: string;
    username: string;
    active: boolean;
    approved: boolean;
  }) {
    try {
      const headers = {
        headers: {
          'Api-Username': this.configService.get('DISCOURSE_USERNAME'),
        },
      };
      const response: Observable<any> = this.httpService.post(
        '/users.json',
        payload,
        headers,
      );
      const result = await lastValueFrom(response);
      return result.data;
    } catch (error) {
      this.logger.error(error?.message, error);
      return;
    }
  }

  /**
   * @description Fetches the list of tags from discourse server
   * @returns list of tags from discourse server
   */
  async getTagsList() {
    try {
      const options = { url: '/tags.json', method: 'get' };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of categories from discourse server
   * @param userName Logged in user's Disourse username
   * @returns list of categories from discourse server
   */
  async getListOfCategories(userName: string) {
    try {
      const options = { url: '/categories.json', method: 'get', userName };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Function is called from community service,
   *  while create a new topic or replying to the topic (Note: Reply is considered as post in discourse)
   * @param payload Payload differs based on type whether its is to create a topic or reply to topic
   * @param userName Logged in user's Disourse username
   * @returns list of tags from discourse server
   */
  async createTopicOrPostOrReply(payload, userName: string) {
    try {
      const options = {
        url: '/posts.json',
        method: 'post',
        userName,
        payload,
      };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of topics based on given filters from discourse server
   * @param filter TopicFilterDto data
   * @param userName Logged in user's Disourse username
   * @returns List of latest topics from discourse server
   */
  async getTopics(filter: TopicFilterDto, userName: string): Promise<any> {
    try {
      const categoryId =
        filter?.categoryId === undefined ? undefined : filter?.categoryId;
      const categorySlug =
        filter?.categorySlug === undefined ? undefined : filter?.categorySlug;
      const tagSlug =
        filter?.tagSlug === undefined ? undefined : filter?.tagSlug;
      const page = filter?.page === 0 ? undefined : filter?.page;

      let topicUrl = `/latest.json?ascending=false&page=${page}`;
      if (categorySlug !== undefined && tagSlug === undefined) {
        topicUrl = `/c/${categorySlug}/${categoryId}/l/latest.json?ascending=false&page=${page}`;
      } else if (categorySlug !== undefined && tagSlug !== undefined) {
        topicUrl = `/tags/c/${categorySlug}/${categoryId}/${tagSlug}/l/latest.json?ascending=false&page=${page}`;
      } else if (categorySlug === undefined && tagSlug !== undefined) {
        topicUrl = `tag/${tagSlug}/l/latest.json?ascending=false&page=${page}`;
      }

      const options = {
        url: topicUrl,
        method: 'get',
        userName,
      };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @descriptions Fetchs topic detail and list of post and suggested topics from discourse server
   * @param topicId Topic id
   * @param userName Logged in users discourse user name
   * @returns Topic details from disourse server
   */
  async getTopicById(topicId: number, userName: string): Promise<any> {
    try {
      const options = {
        url: `/t/${topicId}.json`,
        method: 'get',
        userName,
      };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Fetches the list of replies for the given post id
   * @param postId Post id
   * @param userName Logged in users discourse user name
   * @returns List of replies for the post id from discourse server
   */
  async getRepliesForPostId(postId: number, userName: string): Promise<any> {
    try {
      const options = {
        url: `/posts/${postId}/replies.json`,
        method: 'get',
        userName,
      };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Hits the discourse server to mark as liked for given post id
   * @param payload {id, post_action_type_id, flag_topic}
   * @param userName Logged in users discourse user name
   * @returns liked post info
   */
  async likePost(
    payload: { id: number; post_action_type_id: number; flag_topic: boolean },
    userName: string,
  ) {
    try {
      const options = {
        url: `/post_actions.json`,
        method: 'post',
        payload,
        userName,
      };
      return await this.getDataFromDiscourse(options);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
