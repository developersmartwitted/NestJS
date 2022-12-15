import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ethers } from 'ethers';

import * as message from '../../shared/http/message.http';
import { ConfigService } from '../../shared/config/config.service';
import { LoggerService } from '../../shared/providers/logger.service';
import { ClientProjectRepository } from '../clientProject/repositories/clientProject.repository';
import { CertificationRepository } from '../education/repositories/certification.repository';
import { EducationRepository } from '../education/repositories/education.repository';
import { EmploymentRepository } from '../employment/repositories/employment.repository';
import { SkillUserMapRepository } from '../skill/repositories/skillUserMap.repository';
import { UserDto } from '../user/dto/UserDto';
import { WalletDto } from './dto/WalletDto';
import { WalletRepository } from './repositories/wallet.repository';

@Injectable()
export class WalletService {
  constructor(
    public readonly walletRepository: WalletRepository,
    public readonly skillUserMapRepo: SkillUserMapRepository,
    public readonly employmentRepo: EmploymentRepository,
    public readonly educationRepo: EducationRepository,
    public readonly certificationRepo: CertificationRepository,
    public readonly clientProjectRepo: ClientProjectRepository,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}
  private derivationPath = "m/44'/60'/0'/0/";

  /**
   * @description Called from "getWalletInfo" function if the user does not have wallet
   * @param user Logged in user info
   * @returns Newly created wallet info
   * @author Samsheer Alam
   */
  async createWallet(user: UserDto) {
    try {
      const userWallet = await this.walletRepository.findOne({ user });
      if (userWallet !== undefined) {
        this.logger.error(
          'Error while creating a wallet: User already has a wallet',
        );
        return;
      }
      const walletInfo = await this.walletRepository.find({
        order: { pathIndex: 'DESC' },
        take: 1,
      });
      let pathIndex = 0;
      if (walletInfo.length > 0) {
        pathIndex = walletInfo[0].pathIndex + 1;
      }

      const mnemonicWallet = ethers.Wallet.fromMnemonic(
        this.configService.get('MNEMONICS'),
        `${this.derivationPath}${pathIndex}`,
      );
      const address = mnemonicWallet.address;
      const walletAddress = `0x${address.slice(2)}`;

      const walletData = this.walletRepository.create({
        user,
        pathIndex,
        walletAddress,
      });
      return await this.walletRepository.save(walletData);
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }

  /**
   * @description Checks if advance KYC is completed,
   * and only if advance KYC and user does not wallet then new wallet is created or else wallet info is retured
   * @param user Logged in user info
   * @returns Wallet info
   * @author Samsheer Alam
   */
  async getWalletInfo(user: UserDto): Promise<WalletDto> {
    try {
      const skill = await this.skillUserMapRepo.find({ user });
      const employment = await this.employmentRepo.find({ user });
      const education = await this.educationRepo.find({ user });
      const certification = await this.certificationRepo.find({ user });
      const clientProject = await this.clientProjectRepo.find({ user });

      if (
        skill.length === 0 ||
        employment.length === 0 ||
        education.length === 0 ||
        certification.length === 0 ||
        clientProject.length === 0
      ) {
        throw new BadRequestException('Advanced KYC needed to enable wallet.');
      }
      const userWallet = await this.walletRepository.findOne({ user });
      if (userWallet === undefined) {
        return await this.createWallet(user);
      }
      return userWallet;
    } catch (error) {
      this.logger.error(error?.message, error);
      if (error?.response?.statusCode !== 500) throw error;
      throw new InternalServerErrorException(message.InternalServer);
    }
  }
}
