import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendProjectInviteDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Id.',
  })
  readonly projectId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Members name.',
  })
  readonly name: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: 'Members email id.',
  })
  readonly email: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Array of skill name(Note: It is not a skill id, it is a skill name).',
  })
  readonly skills: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment for sending invites.',
  })
  readonly comment: string;
}
