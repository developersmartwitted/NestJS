import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommunityTagDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tag slug from discourse, which is sent back as value',
  })
  tagSlug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the dicourse tags which is shown on FE',
  })
  tagName: string;
}
