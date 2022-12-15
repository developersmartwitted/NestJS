import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { UserEntity } from '../../user/entities/user.entity';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';
import * as message from '../../../shared/http/message.http';
import { LoggerService } from '../../../shared/providers/logger.service';

@EntityRepository(RefreshTokenEntity)
export class RefreshTokenRepository extends Repository<RefreshTokenEntity> {
  constructor(private logger: LoggerService) {
    super();
  }

  /**
   * Function to create refresh token and save it in DB
   * @param user
   * @param ttl
   * @returns {Promise<RefreshTokenDto>}
   */
  public async createRefreshToken(
    user: UserEntity,
    ttl: number,
  ): Promise<RefreshTokenDto> {
    try {
      const expiration = new Date();
      expiration.setTime(expiration.getTime() + ttl);

      const token = {
        user: user.id,
        isRevoked: false,
        expires: expiration,
      };

      const currentRecord = await this.findTokenByUserId(user.id);

      // If refresh token not present then insert it.
      if (currentRecord === undefined) {
        const refreshToken = this.create(token);
        return this.save(refreshToken);
      }
      currentRecord.isRevoked = false;
      currentRecord.expires = expiration;

      return this.save(currentRecord);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * Function to find token by userID for refresh token
   * @param user
   * @returns {Promise<RefreshTokenDto | null>}
   */
  public async findTokenByUserId(
    user: string,
  ): Promise<RefreshTokenDto | null> {
    try {
      return this.findOne({
        where: {
          user,
        },
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * Function to fetch token by token ID
   * @param id
   * @returns {Promise<RefreshTokenDto | null>}
   */
  public async findTokenByTokenId(id: string): Promise<RefreshTokenDto | null> {
    try {
      return this.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
