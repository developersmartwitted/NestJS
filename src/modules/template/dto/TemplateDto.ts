import { ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../../user/entities/user.entity';
import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { TemplateEntity } from '../entities/template.entity';

export class TemplateDto extends AbstractDto {
  @ApiPropertyOptional({
    type: () => UserEntity,
    description: 'User id, who has created this template.',
  })
  createdBy: UserEntity;

  @ApiPropertyOptional({
    description: 'Template slug, which is to be shown on FE.',
  })
  slug: string;

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

  constructor(template: TemplateEntity) {
    super(template);
    this.createdBy = template.createdBy;
    this.slug = template.slug;
    this.publishedTitle = template.publishedTitle;
    this.publishedDescription = template.publishedDescription;
    this.lastPublisedAt = template.lastPublisedAt;
    this.draftedTitle = template.draftedTitle;
    this.draftedDescription = template.draftedDescription;
    this.lastDraftedAt = template.lastDraftedAt;
    this.status = template.status;
  }
}
