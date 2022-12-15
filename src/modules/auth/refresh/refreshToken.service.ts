import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoggerService } from '../../../shared/providers/logger.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { RefreshRequestDto } from '../dto/payload/RefreshRequestDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { TokenPayloadDto } from '../dto/TokenPayloadDto';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import * as message from '../../../shared/http/message.http';

@Injectable()
export class RefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private authService: AuthService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private logger: LoggerService,
  ) {}

  /**
   * @description Calls resolveRefreshToken function to validate the refreshtoken and then generates a new access and refresh token
   * Called from "createToken" function (auth service).
   * @param refresh {refresh token}
   * @returns {User, token} user table data and token consist of access token
   * @author Samsheer Alam
   */
  async createAccessTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ user: UserEntity; token: TokenPayloadDto }> {
    try {
      const { user } = await this.resolveRefreshToken(refresh);

      const token = await this.authService.createToken(user);
      return { user, token };
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To validate refresh token, callled from createAccessTokenFromRefreshToken within this service
   * @param encoded {refresh token}
   * @returns { user: UserEntity; token: RefreshTokenDto }
   * @author Samsheer Alam
   */
  async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: UserEntity; token: RefreshTokenDto }> {
    try {
      const payload = await this.decodeRefreshToken(encoded);
      const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

      if (!token) {
        this.logger.error('Refresh token not found.');
        throw new UnprocessableEntityException('Refresh token not found');
      }
      if (token.isRevoked) {
        this.logger.error('Refresh token is revoked');
        throw new UnprocessableEntityException('Refresh token revoked');
      }
      const user = await this.getUserFromRefreshTokenPayload(payload);

      if (!user) {
        this.logger.error('User with refresh token is not found');
        throw new UnprocessableEntityException('Refresh token malformed');
      }
      return { user, token };
    } catch (e) {
      this.logger.error('Error while resolving refresh token', { error: e });
      throw new UnprocessableEntityException('Refresh token malformed');
    }
  }

  /**
   * @description To decode refresh token and validate it. called from resolveRefreshToken function within this service
   * @param token
   * @returns {Promise<RefreshRequestDto>} {refreshToken}
   * @author Samsheer Alam
   */
  async decodeRefreshToken(token: string): Promise<RefreshRequestDto> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      this.logger.error('Error while decoding refresh token', { error: e });
      throw new UnprocessableEntityException('Refresh token malformed');
    }
  }

  /**
   * @description To fetch the token info stored in DB and return it
   * called from resolveRefreshToken function within this service
   * @param payload
   * @returns {Promise<RefreshTokenDto | null> } {isRevoked, expires}
   * @author Samsheer Alam
   */
  async getStoredTokenFromRefreshTokenPayload(
    payload: any,
  ): Promise<RefreshTokenDto | null> {
    try {
      const tokenId = payload.jti;
      if (!tokenId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
      return this.refreshTokenRepo.findTokenByTokenId(tokenId);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description To fetch userInfo from refresh token
   * called from resolveRefreshToken function within this service
   * @param payload
   * @returns { Promise<UserEntity> } user table data
   * @author Samsheer Alam
   */
  private async getUserFromRefreshTokenPayload(
    payload: any,
  ): Promise<UserEntity> {
    try {
      const subId = payload.sub;
      if (!subId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
      return this.userService.findOneUser({
        id: subId,
      });
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
