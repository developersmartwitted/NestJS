import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PostReplyDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Raw data of the post',
  })
  raw: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'post Id',
  })
  postId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'topic Id',
  })
  topicId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'postNumber for which the reply is sent.',
  })
  replyToPostNumber: number | null;
}
