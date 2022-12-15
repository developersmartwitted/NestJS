import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import moment from 'moment';

import * as message from '../../shared/http/message.http';
import { FilterDto } from '../../helpers/dto/FilterDto';
import { PageDto } from '../../helpers/dto/PageDto';
import { PageMetaDto } from '../../helpers/dto/PageMetaDto';
import { UserDto } from '../user/dto/UserDto';
import { InvoiceDto } from './dto/InvoiceDto';
import { InvoicePayloadDto } from './dto/payload/InvoicePayloadDto';
import { InvoiceRepository } from './repositories/invoice.repository';
import { LoggerService } from '../../shared/providers/logger.service';
import { StripeAccountRepository } from './repositories/stripeAccount.repository';
import { InvoiceHistoryDto } from './dto/response/InvoiceHistoryDto';
import { StripeConnectDto } from './dto/response/StripeConnectDto';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class StripeService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    private logger: LoggerService,
    private configService: ConfigService,
    public readonly invoiceRepository: InvoiceRepository,
    public readonly stripeAccountRepository: StripeAccountRepository,
  ) {}

  /**
   * @description Checks if account on stripe is already created or not, if created then account link is generated or
   * else new account id is generated and then link is created for user to create an account on stripe
   * @param user Logged in user account
   * @returns Stripe link where user can continue and create a stripe account
   * @author Samsheer Alam
   */
  async connectStripe(user: UserDto): Promise<StripeConnectDto> {
    try {
      let accountId = await this.checkAccountStatus(user);
      if (accountId === undefined) {
        const account = await this.stripeClient.accounts.create({
          type: 'express',
          email: user.email,
        });
        accountId = account.id;
        const accountRef = this.stripeAccountRepository.create({
          user,
          accountId,
        });
        await this.stripeAccountRepository.save(accountRef);
      }
      const link = await this.stripeClient.accountLinks.create({
        type: 'account_onboarding',
        account: accountId,
        refresh_url: 'https://www.panoton.com/stripe/refresh',
        return_url: `${this.configService.get(
          'FE_BASE_URL',
        )}/payment?status=true`,
      });
      return { link: link?.url };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description gets account info for "" function
   * @param user Logged in user info
   * @returns account Id
   * @author Samsheer Alam
   */
  async checkAccountStatus(user: UserDto): Promise<string | undefined> {
    try {
      const account = await this.stripeAccountRepository.findOne({
        user,
      });
      return account?.accountId;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Generates invoice on stripe and saves the invoice info in DB
   * @param user Logged in user info
   * @param invoicePayload InvoicePayloadDto data
   * @returns saved invoice data
   * @author Samsheer Alam
   */
  async generateInvoice(
    user: UserDto,
    invoicePayload: InvoicePayloadDto,
  ): Promise<InvoiceDto> {
    try {
      const customerId = await this.getCustomerId(user, invoicePayload);
      const dueDate = moment(invoicePayload.dueDate).diff(
        moment(new Date()).startOf('day').format(),
        'days',
      );
      await this.stripeClient.invoiceItems.create({
        customer: customerId,
        unit_amount: invoicePayload.amount * 100,
        currency: 'usd',
        description: invoicePayload.comment,
        quantity: 1,
      });
      const invoice = await this.stripeClient.invoices.create({
        customer: customerId,
        description: invoicePayload.comment,
        collection_method: 'send_invoice',
        days_until_due: dueDate,
      });
      await this.stripeClient.invoices.finalizeInvoice(invoice.id);
      await this.stripeClient.invoices.sendInvoice(invoice.id);
      const invoiceData = {
        ...invoicePayload,
        customerId,
        user,
        invoiceId: invoice.id,
      };
      const invoiceRef = this.invoiceRepository.create(invoiceData);
      return await this.invoiceRepository.save(invoiceRef);
    } catch (error) {
      this.logger.error('Error while generating invoice: ', {
        error: error.message,
      });
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * @description Fetches all the invoice hisory for the user along  with invoices
   * @param filterDto Page and limit (pagination info)
   * @param user Logged in user info
   * @returns Invoice history list
   * @author Samsheer Alam
   */
  async getInvoiceHistory(
    filterDto: FilterDto,
    user: UserDto,
  ): Promise<PageDto<InvoiceHistoryDto>> {
    try {
      const queryResult = await this.invoiceRepository.getInvoiceHistory(
        filterDto,
        user,
      );
      const result = queryResult.data.map((item: any) => {
        return {
          userId: item?.user?.id === undefined ? '' : item?.user?.id,
          invoiceId: item?.id === undefined ? '' : item?.id,
          stripeInvoiceId:
            item?.invoiceId === undefined ? '' : item.description,
          customerId: item?.customerId === undefined ? '' : item?.customerId,
          email: item?.email === undefined ? '' : item?.email,
          amount: item?.amount === undefined ? '' : item?.amount,
          dueDate: item?.dueDate === undefined ? '' : item?.dueDate,
          createdAt: item?.createdAt === undefined ? '' : item?.createdAt,
          comment: item?.comment === undefined ? '' : item?.comment,
          status: item?.status === undefined ? '' : item?.status,
        };
      });
      const pageMetaDto = new PageMetaDto({
        pageOptionsDto: queryResult.pageOptionsDto,
        totalRecord: queryResult.totalRecord,
      });
      return new PageDto(result, pageMetaDto);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description If customer already exist for logged in users accoun then sends customer id from DB
   * or else creates account Id on stripe and sends it.
   * Called from "generateInvoice" function
   * @param user Logged in user info
   * @param invoicePayload Invoice payload given in request body
   * @returns customer id
   * @author Samsheer Alam
   */
  async getCustomerId(
    user: UserDto,
    invoicePayload: InvoicePayloadDto,
  ): Promise<string> {
    try {
      const account = await this.updateAccountStatus(user);
      if (!account.status) {
        throw new BadRequestException(message.StripeAccountNotFound);
      }
      const invoiceInfo = await this.invoiceRepository.findOne({
        user,
        email: invoicePayload.email,
        isDeleted: false,
      });
      let customerId = invoiceInfo?.customerId;
      if (invoiceInfo === undefined) {
        const customer = await this.stripeClient.customers.create({
          email: invoicePayload.email,
        });
        customerId = customer.id;
      }
      return customerId;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Called from "getCustomerId" function to check the account status and update it. and return accountInfo
   * @param user Logged in user info
   * @returns account info
   * @author Samsheer Alam
   */
  async updateAccountStatus(user: UserDto) {
    try {
      const accountInfo = await this.stripeAccountRepository.findOne({
        user,
        isDeleted: false,
      });
      if (accountInfo === undefined) {
        throw new BadRequestException(message.StripeAccountNotFound);
      }
      const accountStatusOnStripe = await this.stripeClient.accounts.retrieve(
        accountInfo.accountId,
      );
      accountInfo.status = accountStatusOnStripe.details_submitted;
      await this.stripeAccountRepository.save(accountInfo);
      return accountInfo;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if valid id, then checks the verificationId of the invoice and updates the DB.
   * @param invoiceId primary key of the invoice table
   * @param user Logged in user info
   * @author Samsheer Alam
   */
  async verifyInvoice(invoiceId: string, user: UserDto) {
    try {
      const invoiceInfo = await this.invoiceRepository.findOne({
        user,
        id: invoiceId,
      });
      if (invoiceInfo === undefined) {
        throw new BadRequestException(message.InvoiceNotFound);
      }
      /** Check invoice Id status on stripe */
      const invoice = await this.stripeClient.invoices.retrieve(
        invoiceInfo.invoiceId,
      );
      // const invoiceStatus = true; // from stripe
      if (invoice?.paid === undefined || !invoice.paid) {
        throw new BadRequestException(message.InvoiceNotVerified);
      }
      invoiceInfo.status = invoice?.paid;
      await this.invoiceRepository.save(invoiceInfo);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @descriptio Checks the account is created on stripe or not.
   * If created and status is false then checks status on stripe and updates the status and sends it to FE.
   * @param user Logged in userinfo
   * @returns Checks the account info and sends the status
   * @author Samsheer Alam
   */
  async getAccountInfo(user: UserDto): Promise<{ accountStatus: boolean }> {
    try {
      const accountInfo = await this.stripeAccountRepository.findOne({
        user,
        isDeleted: false,
      });
      if (accountInfo === undefined) {
        return { accountStatus: false };
      }
      if (!accountInfo?.status) {
        try {
          const accountStatusOnStripe =
            await this.stripeClient.accounts.retrieve(accountInfo.accountId);
          accountInfo.status = accountStatusOnStripe.details_submitted;
          await this.stripeAccountRepository.save(accountInfo);
        } catch (error) {
          this.logger.error('Error while checking account status invoice: ', {
            error: error.message,
          });
          return { accountStatus: accountInfo.status };
        }
      }
      return { accountStatus: accountInfo.status };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
