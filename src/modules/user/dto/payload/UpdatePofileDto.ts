import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email id, valid email format.',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: 'firstName, max of 100 characters.',
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: 'lastName, max of 100 characters.',
  })
  lastName: string;

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
  @IsOptional()
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
  @IsOptional()
  @ApiProperty({
    description: 'external link, like github repo etc.',
  })
  externalLink?: string;
}
