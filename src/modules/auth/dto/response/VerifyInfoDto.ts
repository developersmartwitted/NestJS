import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyInfoDto {
  @ApiPropertyOptional({
    description: 'True if user is registered or false if user is unregistered.',
  })
  isRegistered: boolean;

  @ApiPropertyOptional({
    description:
      'Type of verification id it is, It can be SKILLS, EMPLOYMENT, CLIENT_PROJECT etc',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Verification id.',
  })
  varificationId: string;

  @ApiPropertyOptional({
    description: 'True if already verified.',
  })
  isVerified: boolean;
}
