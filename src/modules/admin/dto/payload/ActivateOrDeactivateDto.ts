import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class ActivateOrDeactivateDto {
  @IsUUID()
  @IsNotEmpty({
    message: 'UserId can not be empty',
  })
  @ApiPropertyOptional({
    description: 'User id for the user for status needs to be updated.',
  })
  userId: string;

  @IsBoolean()
  @IsNotEmpty({
    message: 'statusToUpdate can not be empty',
  })
  @ApiPropertyOptional({
    description:
      'True if user needs to be activated. False if user needs to be suspended.',
  })
  statusToUpdate: boolean;
}
