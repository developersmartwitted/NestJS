import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateNotificationStatus {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Notification id.',
  })
  readonly notificationId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If notification needs to be marked as viewed.',
  })
  readonly viewed: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'If notification needs to be marked as deleted.',
  })
  readonly remove: boolean;
}
