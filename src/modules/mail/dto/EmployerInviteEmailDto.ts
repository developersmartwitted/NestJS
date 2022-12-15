import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmployerInviteEmailDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Name of the employer.',
  })
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Company or oganization name.',
  })
  readonly organizationName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Designation or role in the company.',
  })
  readonly role: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Company or organization logo.',
  })
  readonly companyLogo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Duration worked in the company.',
  })
  readonly activeYears: string;

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
