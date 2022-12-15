import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../helpers/dto/AbstractDto';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export class RefreshTokenDto extends AbstractDto {
  @ApiPropertyOptional()
  isRevoked: boolean;

  @ApiPropertyOptional()
  expires: Date;

  constructor(refreshToken: RefreshTokenEntity) {
    super(refreshToken);
    this.isRevoked = refreshToken.isRevoked;
    this.expires = refreshToken.expires;
  }
}
