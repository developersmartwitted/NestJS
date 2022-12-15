import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { SkillVerifyDto } from './SkillVerifyDto';

export class SkillInviteDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill id, which is to be verified.',
  })
  readonly skillId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Minimum one invitation needs to be included.' })
  @ArrayMaxSize(5, { message: 'Maximum of only 5 invitaiton can be sent.' })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Array of skill member info.',
  })
  readonly members: SkillVerifyDto[];
}
