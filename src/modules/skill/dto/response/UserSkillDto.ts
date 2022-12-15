import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserSkillDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill Id.',
  })
  readonly skillId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill name.',
  })
  readonly skillName: string;

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
