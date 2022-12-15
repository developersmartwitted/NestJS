import { ApiProperty } from '@nestjs/swagger';

export class TemplateInfoDto {
  @ApiProperty({
    description: 'Publish title name',
  })
  title: string;

  @ApiProperty({
    description: 'Published description',
  })
  description: string;
}
