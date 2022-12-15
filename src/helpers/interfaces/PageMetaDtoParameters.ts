import { FilterDto } from '../../helpers/dto/FilterDto';

export interface PageMetaDtoParameters {
  pageOptionsDto: FilterDto;
  totalRecord: number;
}
