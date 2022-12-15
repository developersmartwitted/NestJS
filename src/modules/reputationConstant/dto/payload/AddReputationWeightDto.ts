import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddReputationWeightDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Basic KYC percentage.',
  })
  readonly basicKyc: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Advance KYC percentage.',
  })
  readonly advanceKyc: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skill rating percentage.',
  })
  readonly skillRating: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Skills percentage.',
  })
  readonly skills: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Education percentage.',
  })
  readonly education: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Certificate percentage.',
  })
  readonly certification: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Client project percentage.',
  })
  readonly clientProject: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Employment history percentage.',
  })
  readonly employmentHistory: number;
}
