import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateNotificationSettings {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Notification setting id.',
  })
  readonly notificationSettingId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If user wants to receive emails or not.',
  })
  readonly isEmail: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of external connections allowed per user.',
  })
  readonly externalConnection: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Number of internal connections allowed per user.',
  })
  readonly internalConnection: number;
}
