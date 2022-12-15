import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PostResponseDto {
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the topic.',
  })
  topicId: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Id of the post.',
  })
  postId: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post message with html tag.',
  })
  post: string;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Raw post message.',
  })
  raw: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'No of replies for the post.',
  })
  replyCount: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Discourse userName of the person who has created the post.',
  })
  userName: string;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post number within the topic.',
  })
  postNumber: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'If the post is reply postm then it is the post number of the post to which it is replied.',
  })
  replyToPostNumber: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Reply to Discourse userName to which the post is replied to.',
  })
  replyToUserName: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'True if like icon needs to be shown for the post.',
  })
  showLike: boolean;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Date at which the post is created.',
  })
  createdAt: string;

  @IsBoolean()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Defines if the post is already liked by the user or not.',
  })
  liked: boolean;
}
