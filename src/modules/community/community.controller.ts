import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommunityService } from './community.service';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CreateTopicDto } from './dto/payload/createTopicDto';
import { PostReplyDto } from './dto/payload/PostReplyDto';
import { User } from '../../helpers/decorators/user.decorator';
import { UserDto } from '../user/dto/UserDto';
import { CommunityTagDto } from './dto/response/CommunityTagDto';
import { CommunityCategoryDto } from './dto/response/CommunityCategoryDto';
import { RepliesDto } from './dto/response/RepliesDto';

@ApiTags('Community')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComUserCreated })
  async createNewUser(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.communityService.createDiscourseUser(user);
    if (!result?.status) {
      throw new BadRequestException(result?.message);
    }
    return new HttpOkResponse(undefined, message.ComUserCreated);
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComTag, type: CommunityTagDto })
  async getTags(): Promise<HttpResponse> {
    const tags = await this.communityService.getListOfTags();
    return new HttpOkResponse(tags, message.ComTag);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: message.ComCategory,
    type: CommunityCategoryDto,
  })
  async getCategories(@User() user: UserDto): Promise<HttpResponse> {
    const tags = await this.communityService.getListOfCategories(user);
    return new HttpOkResponse(tags, message.ComCategory);
  }

  @Post('topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComTopicCreated })
  async getPosts(
    @Body() createTopicPayload: CreateTopicDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.communityService.createNewTopic(createTopicPayload, user);
    return new HttpOkResponse(undefined, message.ComTopicCreated);
  }

  @Get('topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComTopics })
  async getTopics(
    @Query() filter,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.communityService.getTopics(filter, user);
    return new HttpOkResponse(result, message.ComTopics);
  }

  @Get('topics/:topicId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComTopics })
  async getTopicDetails(
    @Param('topicId') topicId: number,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.communityService.getTopicDetails(topicId, user);
    return new HttpOkResponse(result, message.ComTopics);
  }

  @Get('post/:postId/replies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.ComTopics, type: RepliesDto })
  async getReplies(
    @Param('postId') postId: number,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.communityService.getPostReplyDetails(
      postId,
      user,
    );
    return new HttpOkResponse(result, message.ComTopics);
  }

  @Post('/post/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Reply to the post',
  })
  async replyToPost(@Body() replyPayload: PostReplyDto, @User() user: UserDto) {
    await this.communityService.replyToPost(replyPayload, user);
    return new HttpOkResponse(undefined, message.ComPostReply);
  }

  @Post('/post/:postId/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'like and unlike a post',
  })
  async likePost(@Param('postId') postId: number, @User() user: UserDto) {
    const result = await this.communityService.likeAPost(postId, user);
    return new HttpOkResponse(result, message.ComPostReply);
  }
}
