import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SkillPayloadDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill Id.',
  })
  readonly skillId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Levels, Intermediate, Beginner.',
  })
  readonly level: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Experience duration in months or year.',
  })
  readonly experience: string;
}
