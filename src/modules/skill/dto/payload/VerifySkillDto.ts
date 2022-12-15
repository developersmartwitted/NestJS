import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class VerifySkillDto {
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

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Knowledge answer id.',
  })
  readonly knowledge: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Recommendation rating.',
  })
  readonly recommendation: number;
}
