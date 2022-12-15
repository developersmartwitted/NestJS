import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteCertificateDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Certificate Id.',
  })
  readonly certificateId: string;
}
