import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProjectMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Users Id.',
  })
  readonly memberId: string;

  @IsString()
  @ApiProperty({
    description: 'Users email id.',
  })
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'Users designation.',
  })
  readonly job: string;

  @IsString()
  @ApiProperty({
    description: 'users profile image.',
  })
  readonly profileImage: string;

  @IsString()
  @ApiProperty({
    description: 'Users self description.',
  })
  readonly about: string;

  @IsString()
  @ApiProperty({
    description: 'Defines user is owner or freelancer.',
  })
  readonly type: string;
}
