import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConnectionInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'connection memeber name',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'connection member email id.',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Invited member name',
  })
  readonly invitedByName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number of the verifier.',
  })
  invitedByPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Valid email id of user who is inviting.',
  })
  readonly invitedByEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment or breif description about connection.',
  })
  readonly comment: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Url to which it needs to be redirected.',
  })
  readonly verificationUrl: string;
}
