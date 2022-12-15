import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TopicFilterDto {
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    description:
      'Id of the category, It is optional, but becomes mandatory if any category is selected',
  })
  categoryId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description:
      'Category slug, which fetched from category,  It is optional, but becomes mandatory if any category is selected',
  })
  categorySlug: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Tag slug, which fetched from tags',
  })
  tagSlug: string;

  @IsNumber()
  @ApiProperty({
    description: 'postNumber for which the reply is sent.',
  })
  page: number;
}
