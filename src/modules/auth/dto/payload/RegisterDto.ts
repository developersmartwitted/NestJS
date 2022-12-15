import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email id, valid email format.',
  })
  email: string;

  @IsNotEmpty()
  @Matches(/^[a-z|A-Z]+(?: [a-z|A-Z]+)*$/, {
    message: 'First name can not have special characters or number',
  })
  @MaxLength(50)
  @ApiProperty({
    description:
      'firstName, max of 50 characters and no special characters or number is allowed.',
  })
  firstName: string;

  @IsNotEmpty()
  @Matches(/^[a-z|A-Z]+(?: [a-z|A-Z]+)*$/, {
    message: 'Last name can not have special characters or number',
  })
  @MaxLength(50)
  @ApiProperty({
    description:
      'lastName, max of 50 characters and no special characters or number is allowed.',
  })
  lastName: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(25)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  @ApiProperty({
    description:
      'Password must consist of one uppercase letter, one lowercase letter and one special character.',
    type: String,
  })
  password: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description:
      'Either true or false representing if termsAndCondition is accepted by user.',
  })
  termsAndCondition: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Full address.',
  })
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'State name',
  })
  state: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Country name.',
  })
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User phone number.',
  })
  phoneNumber: string;

  @IsUrl()
  @ApiProperty({
    description: 'website url.',
  })
  personalWebsite?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '({folder}/{fileName}) of image uploaded in s3 bucket.',
  })
  profileImage: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Hourly rate.',
  })
  hourlyRate: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Basic description of user i.e about yourself.',
  })
  about: string;

  @IsString()
  @ApiProperty({
    description: 'external link, like github repo etc.',
  })
  externalLink?: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty({
    description: 'User who has invited this user.',
  })
  invitedBy?: string;
}
