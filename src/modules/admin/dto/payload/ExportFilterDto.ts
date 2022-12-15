import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ExportFilterDto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({
    message: 'UserId can not be empty',
  })
  @ApiPropertyOptional({
    description: 'If specific user info needs to be exported.',
  })
  userId?: string;

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

  @IsOptional()
  @IsNotEmpty({
    message: 'Status can not be empty',
  })
  @ApiPropertyOptional({
    description: 'If status is not defined then by default .',
  })
  status?: boolean;
}
