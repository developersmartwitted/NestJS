import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PageMetaDto } from './PageMetaDto';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly paginationData: PageMetaDto;

  constructor(data: T[], paginationData: PageMetaDto) {
    this.paginationData = paginationData;
    this.data = data;
  }
}
