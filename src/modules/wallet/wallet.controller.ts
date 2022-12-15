import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import HttpOkResponse from '../../shared/http/ok.http';
import HttpResponse from '../../shared/http/response.http';
import * as message from '../../shared/http/message.http';

import { User } from '../../helpers/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { UserDto } from '../user/dto/UserDto';
import { WalletService } from './wallet.service';

@Controller('wallet')
@ApiBearerAuth()
@ApiTags('Wallet')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: 'Wallet info.' })
  async getWalletInfo(@User() user: UserDto): Promise<HttpResponse> {
    const wallet = await this.walletService.getWalletInfo(user);
    return new HttpOkResponse(wallet, message.WalletInfo);
  }
}
