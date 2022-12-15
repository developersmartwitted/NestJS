import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class VerifyEmploymentDto {
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
    description: 'If position is correct then true or false.',
  })
  readonly position: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If employment dates are correct then true or false.',
  })
  readonly employmentDates: boolean;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Answer id of Yes or No. If user is rehireable then Yes or No. ',
  })
  readonly isRehireable: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Recommendation rating.',
  })
  readonly recommendation: number;
}
