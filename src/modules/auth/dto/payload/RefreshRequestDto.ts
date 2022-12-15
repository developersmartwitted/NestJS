import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshRequestDto {
  @IsString()
  @ApiProperty({
    description:
      'Refresh token (generated during last login or last token refresh)',
  })
  refreshToken: string;
}
