import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsUUID } from 'class-validator';

export class TemplateListDto {
  @IsUUID()
  @ApiProperty({
    description: 'Template id',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Publish title name',
  })
  publishedTitle: string;

  @ApiPropertyOptional({
    description: 'Published description',
  })
  publishedDescription: string;

  @ApiPropertyOptional({
    description: 'Last published at (Date and Time)',
  })
  lastPublisedAt: Date;

  @ApiPropertyOptional({
    description: 'Drafted Title',
  })
  draftedTitle: string;

  @ApiPropertyOptional({
    description: 'Drafted description',
  })
  draftedDescription: string;

  @ApiPropertyOptional({
    description: 'Drafted description',
  })
  lastDraftedAt: Date;

  @ApiPropertyOptional({
    description: 'Status true or false, Defines template is active or not.',
  })
  status: boolean;
}
