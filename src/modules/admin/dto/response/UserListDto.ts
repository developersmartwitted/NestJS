import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UserListDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'User id.',
  })
  userId: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'True if account is active, false it user is suspended.',
  })
  status: boolean;

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
    description: 'External link, like github repo etc.',
  })
  externalLinks?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Users designation',
  })
  domain?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Users role in designation',
  })
  domainRole?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Reputation score',
  })
  reputationScore?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'No of connection user has',
  })
  connectionCount?: number;

  @IsDate()
  @IsOptional()
  @ApiProperty({
    description: 'Date at which user is created',
  })
  createdAt?: string | Date;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Defines whether the user is registered in discourse or not',
  })
  isDiscourseUser?: boolean;
}
