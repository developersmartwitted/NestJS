import { ApiProperty } from '@nestjs/swagger';
import { TokenPayloadDto } from '../TokenPayloadDto';

export class LoginResponseDto {
  @ApiProperty({ type: TokenPayloadDto })
  token: TokenPayloadDto;

  @ApiProperty()
  role: number;

  constructor(token: TokenPayloadDto, role: number) {
    this.token = token;
    this.role = role;
  }
}
