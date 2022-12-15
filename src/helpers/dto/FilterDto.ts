import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

enum OrderBy {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FilterDto {
  @IsOptional()
  @IsNotEmpty({
    message: 'Search can not be empty',
  })
  @ApiPropertyOptional({
    description: 'String which is to be searched for.',
  })
  search?: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Status can not be empty',
  })
  status?: boolean;

  @IsOptional()
  @IsNotEmpty({
    message: 'OrderType can not be empty',
  })
  @IsEnum(OrderBy)
  orderType?: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Page can not be empty',
  })
  @ApiPropertyOptional({
    description: 'Page which is to be shown.',
  })
  page?: number;

  @IsOptional()
  @IsNotEmpty({
    message: 'Limit can not be empty',
  })
  @ApiPropertyOptional({
    description: 'No of records which is to be shown.',
  })
  limit?: number;
}
