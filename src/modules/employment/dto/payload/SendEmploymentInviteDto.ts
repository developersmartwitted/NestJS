import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmploymentInvite {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Employment id which needs to be verifies.',
  })
  readonly employmentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verifiers first name.',
  })
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'verifiers last name',
  })
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verifiers email id',
  })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verfiers role (designation).',
  })
  readonly role: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comment which is to eb shown to the verifier',
  })
  readonly comments: string;
}
