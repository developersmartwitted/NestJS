import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CommunityCategoryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Category id, which is sent back as value',
  })
  categoryId: number | null;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Category slug from discourse, which is sent back as value',
  })
  categorySlug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Category Name, which is shown on FE',
  })
  categoryName: string;
}
