import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ClientProjectInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the verifer.',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project name.',
  })
  readonly projectName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project Image',
  })
  readonly projectImage: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cost of the project.',
  })
  readonly projectCost: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Client / Project url.',
  })
  readonly url: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comments by the user to employer.',
  })
  readonly comments: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description:
      'Email id of the emloyer, to whom the email needs to be sent in order to verify.',
  })
  readonly email: string;

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
    description: 'Phone number of the verifier.',
  })
  invitedByPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of user who is inviting.',
  })
  readonly invitedByName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Url to which it needs to be redirected.',
  })
  readonly verificationUrl: string;
}
