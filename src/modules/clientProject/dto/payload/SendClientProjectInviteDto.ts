import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendClientProjectInviteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Client project id which needs to be verifies.',
  })
  readonly clientProjectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verifiers name.',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project cost',
  })
  readonly cost: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verifiers email id',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment which is to eb shown to the client',
  })
  readonly comments: string;
}
