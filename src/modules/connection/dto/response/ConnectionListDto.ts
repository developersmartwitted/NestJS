import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class ConnectionListDto {
  @IsUUID()
  @ApiProperty({
    description: 'Connection id.',
  })
  readonly connectionId: string;

  @IsString()
  @ApiProperty({
    description: 'Members first name',
  })
  readonly firstName: string;

  @IsString()
  @ApiProperty({
    description: 'Members last name',
  })
  readonly lastName: string;

  @IsString()
  @ApiProperty({
    description: 'Valid Email Id.',
  })
  readonly email: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Status defines if the member is connected or not.',
    type: 'boolean',
  })
  readonly status: boolean;

  @IsString()
  @ApiProperty({
    description: 'Members profile image location in s3',
  })
  readonly profileImage: string;

  @IsString()
  @ApiProperty({
    description: 'Members designation',
  })
  readonly job: string;
}
