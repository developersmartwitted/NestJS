import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { StripeService } from './stripe.service';
import { UserDto } from '../user/dto/UserDto';
import { InvoicePayloadDto } from './dto/payload/InvoicePayloadDto';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { StripeConnectDto } from './dto/response/StripeConnectDto';
import { InvoiceHistoryDto } from './dto/response/InvoiceHistoryDto';
import { InvoiceDto } from './dto/InvoiceDto';

@ApiTags('Stripe Invoice')
@ApiUnauthorizedResponse({ description: message.UnAuthorized })
@ApiForbiddenResponse({ description: message.Forbidden })
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.StripeConnect, type: StripeConnectDto })
  async addNewStripeConnect(@User() user: UserDto): Promise<HttpResponse> {
    const link = await this.stripeService.connectStripe(user);
    return new HttpOkResponse(link, message.StripeConnect);
  }

  @Post('invoice')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.InvoiceSent, type: InvoiceDto })
  async sendInvoice(
    @User() user: UserDto,
    @Body() invoicePayload: InvoicePayloadDto,
  ): Promise<HttpResponse> {
    const res = await this.stripeService.generateInvoice(user, invoicePayload);
    return new HttpOkResponse(res, message.InvoiceSent);
  }

  @Get('account-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.StripeAccountInfo })
  async getAccount(@User() user: UserDto): Promise<HttpResponse> {
    const result = await this.stripeService.getAccountInfo(user);
    return new HttpOkResponse(result, message.StripeAccountInfo);
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.InvoiceList, type: InvoiceHistoryDto })
  async getInvoices(
    @Query() filterDto: FilterDto,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    const result = await this.stripeService.getInvoiceHistory(filterDto, user);
    return new HttpOkResponse(result, message.InvoiceList);
  }

  @Get('invoice/:invoiceId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.InvoiceVerified })
  @ApiBadRequestResponse({
    description: `${message.InvoiceNotFound} (Or) ${message.InvoiceNotVerified}`,
  })
  async verifyInvoice(
    @Param('invoiceId') invoiceId: string,
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.stripeService.verifyInvoice(invoiceId, user);
    return new HttpOkResponse(undefined, message.InvoiceVerified);
  }

  @Put('account-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @ApiOkResponse({ description: message.StripeAccStatusUpdated })
  async checkAndUpdateAccountStatus(
    @User() user: UserDto,
  ): Promise<HttpResponse> {
    await this.stripeService.updateAccountStatus(user);
    return new HttpOkResponse(undefined, message.StripeAccStatusUpdated);
  }
}
