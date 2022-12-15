import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class TeamMemberDto {
  @IsString()
  @ApiProperty({
    description: 'user Id',
  })
  readonly userId: string;

  @IsString()
  @ApiProperty({
    description: 'users first name',
  })
  readonly firstName: string;

  @IsString()
  @ApiProperty({
    description: 'users last name',
  })
  readonly lastName: string;

  @IsArray()
  @ApiProperty({
    description: 'users valid email',
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'users profile image',
  })
  readonly profileImage: string;
}
