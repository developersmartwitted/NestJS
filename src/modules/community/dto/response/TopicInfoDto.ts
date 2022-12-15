import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TopicInfoDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Topic title.',
  })
  title: string;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'No of replies sent for the topic.',
  })
  replyCount: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'No of like count within the topic.',
  })
  likeCount: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'No of views for the topic.',
  })
  viewCount: number;

  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'No of users acted on the topic.',
  })
  userCount: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Date at which the topic is created',
  })
  createdAt: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Date at which the last post was created within the topic',
  })
  lastPostedAt: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Discourse userName of the person who has last posted with in the topic',
  })
  lastPostedBy: string;
}
