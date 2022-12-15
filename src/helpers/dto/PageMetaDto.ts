import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from '../interfaces/PageMetaDtoParameters';

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly totalRecord: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, totalRecord }: PageMetaDtoParameters) {
    this.page = Number(pageOptionsDto.page);
    this.limit = Number(pageOptionsDto.limit);
    this.totalRecord = totalRecord;
    this.totalPages = Math.ceil(this.totalRecord / Number(this.limit));
    this.hasPreviousPage = Number(this.page) > 1;
    this.hasNextPage = Number(this.page) < this.totalPages;
  }
}
