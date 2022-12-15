import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddTemplateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Title which needs to be published.',
  })
  readonly publishedTitle: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Description which needs to be published.',
  })
  readonly publishedDescription: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: `Title which needs to be drafted, 
      If the user clicks publish then the drafted title is moved to publishedTitle and this draftedTitle is made empty.`,
  })
  readonly draftedTitle: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: `Description which needs to be drafted, 
      If the user clicks publish then the drafted title is moved to publishedDescription and this draftedDescription is made empty.`,
  })
  readonly draftedDescription: string;
}
