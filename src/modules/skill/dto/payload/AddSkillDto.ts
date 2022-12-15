import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddSkillDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the skill.',
  })
  readonly name: string;
}
