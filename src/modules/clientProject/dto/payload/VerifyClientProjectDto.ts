import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class VerifyClientProjectDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Verification id.',
  })
  readonly verificationId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Relationship answer id.',
  })
  readonly relationship: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If username is correct then true or false.',
  })
  readonly userName: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If project name is correct then true or false.',
  })
  readonly projectName: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If project cost is correct then true or false.',
  })
  readonly projectCost: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Communication rating.',
  })
  readonly communication: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Collaboration rating.',
  })
  readonly collaboration: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Time management rating.',
  })
  readonly timeManagement: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cost rating.',
  })
  readonly cost: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Project result rating.',
  })
  readonly result: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Recommendation rating.',
  })
  readonly recommendation: number;
}
