import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { InvoiceDto } from '../dto/InvoiceDto';
import { FilterDto } from '../../../helpers/dto/FilterDto';
import { UserDto } from '../../../modules/user/dto/UserDto';
import { InvoiceEntity } from '../entities/invoice.entity';
import * as message from '../../../shared/http/message.http';
import { LoggerService } from '../../../shared/providers/logger.service';

@EntityRepository(InvoiceEntity)
export class InvoiceRepository extends Repository<InvoiceEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * @description Fetches all the invoices data from DB
   * @param filterDto Pagination data, page and limit
   * @param user Logged in user info
   * @returns  Invoice count, array of invoice data, and pagination data
   * @author Samsheer Alam
   */
  async getInvoiceHistory(
    filterDto: FilterDto,
    user: UserDto,
  ): Promise<{
    totalRecord: number;
    data: InvoiceDto[];
    pageOptionsDto: { page: number; limit: number };
  }> {
    try {
      const page = filterDto.page == undefined ? 1 : filterDto.page;
      const limit = filterDto.limit == undefined ? 20 : filterDto.limit;
      const res = await this.findAndCount({
        where: [{ user, isDeleted: false }],
        order: { createdAt: 'DESC' },
        relations: ['user'],
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        totalRecord: res.length > 0 ? res[1] : 0,
        data: res.length > 0 ? res[0] : [],
        pageOptionsDto: { page, limit },
      };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
