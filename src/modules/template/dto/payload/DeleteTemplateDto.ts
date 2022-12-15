import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteTemplateDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    description: 'Template id.',
  })
  readonly templateIds: string[];
}
