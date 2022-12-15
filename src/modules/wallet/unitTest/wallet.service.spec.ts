import { Test } from '@nestjs/testing';
import { ClientProjectRepository } from '../../clientProject/repositories/clientProject.repository';
import { CertificationRepository } from '../../education/repositories/certification.repository';
import { EducationRepository } from '../../education/repositories/education.repository';
import { EmploymentRepository } from '../../employment/repositories/employment.repository';
import { SkillUserMapRepository } from '../../skill/repositories/skillUserMap.repository';
import { LoggerService } from '../../../shared/providers/logger.service';
import { WalletService } from '../wallet.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { ConfigService } from '../../../shared/config/config.service';
import { UserDto } from '../../user/dto/UserDto';
import { WalletDto } from '../dto/WalletDto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WalletEntity } from '../entities/wallet.entity';
import { SkillUserMapEntity } from '../../skill/entities/skillUserMap.entity';

jest.mock('../../../shared/providers/logger.service');
jest.mock('../../../shared/config/config.service');

describe('UserService', () => {
  let service: WalletService;
  let walletRepository: WalletRepository;
  let skillMapRepository: SkillUserMapRepository;
  let employmentRepository: EmploymentRepository;
  let educationRepository: EducationRepository;
  let certificationRepository: CertificationRepository;
  let clientProjectRepository: ClientProjectRepository;
  let logger: LoggerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [
        WalletService,
        WalletRepository,
        {
          provide: WalletRepository,
          useFactory: () => {
            return {
              findOne: jest.fn().mockResolvedValue({}),
              find: jest.fn().mockResolvedValue([]),
            };
          },
        },
        {
          provide: SkillUserMapRepository,
          useFactory: () => {
            return {
              find: jest.fn().mockResolvedValue([SkillUserMapEntity]),
            };
          },
        },
        {
          provide: EmploymentRepository,
          useFactory: () => {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          },
        },
        {
          provide: EducationRepository,
          useFactory: () => {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          },
        },
        {
          provide: CertificationRepository,
          useFactory: () => {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          },
        },
        {
          provide: ClientProjectRepository,
          useFactory: () => {
            return {
              find: jest.fn().mockResolvedValue([]),
            };
          },
        },
        ConfigService,
        LoggerService,
      ],
    }).compile();

    service = moduleRef.get<WalletService>(WalletService);
    logger = moduleRef.get<LoggerService>(LoggerService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    walletRepository = moduleRef.get<WalletRepository>(WalletRepository);
    skillMapRepository = moduleRef.get<SkillUserMapRepository>(
      SkillUserMapRepository,
    );
    employmentRepository =
      moduleRef.get<EmploymentRepository>(EmploymentRepository);
    educationRepository =
      moduleRef.get<EducationRepository>(EducationRepository);
    certificationRepository = moduleRef.get<CertificationRepository>(
      CertificationRepository,
    );
    clientProjectRepository = moduleRef.get<ClientProjectRepository>(
      ClientProjectRepository,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletInfo', () => {
    describe('When getWalletInfo is called', () => {
      let user: UserDto;
      let walletInfo: WalletDto;
      let userMockData: WalletDto;

      beforeEach(async () => {
        try {
          walletInfo = await service.getWalletInfo(user);
        } catch (e) {
          logger.error(e?.message, e);
          expect(logger.error).toHaveBeenCalledWith(e?.message, e);
          if (e?.response?.statusCode !== 500) {
            expect(e).toBeInstanceOf(BadRequestException);
          } else {
            expect(e).toBeInstanceOf(InternalServerErrorException);
          }
        }
      });

      it('it should call find from SkillUserMapRepository', () => {
        expect(skillMapRepository.find).toHaveBeenCalledWith({ user });
      });
      it('it should call find from employmentRepository', () => {
        expect(employmentRepository.find).toHaveBeenCalledWith({ user });
      });
      it('it should call find from educationRepository', () => {
        expect(educationRepository.find).toHaveBeenCalledWith({ user });
      });
      it('it should call find from CertificationRepository', () => {
        expect(certificationRepository.find).toHaveBeenCalledWith({ user });
      });
      it('it should call find from ClientProjectRepository', () => {
        expect(clientProjectRepository.find).toHaveBeenCalledWith({ user });
      });

      it('it should call findOne from walletRepository', async () => {
        let wallet: WalletEntity;
        jest
          .spyOn(walletRepository, 'findOne')
          .mockImplementation(async () => wallet);
        const walletData = await walletRepository.findOne({ user });
        expect(walletRepository.findOne).toBeCalledWith({ user });
        expect(walletData).toStrictEqual(wallet);
      });

      it('it should call createWallet if user wallet info is empty from walletService', async () => {
        let wallet: WalletEntity;
        jest
          .spyOn(service, 'createWallet')
          .mockImplementation(async () => wallet);
        if (wallet === undefined) {
          await service.createWallet(user);
        }
        expect(service.createWallet).toBeCalledWith(user);
      });

      it('it should return', () => {
        expect(walletInfo).toStrictEqual(userMockData);
      });
    });
  });

  describe('createWallet', () => {
    describe('When createWallet is called', () => {
      let user: UserDto;
      let walletInfo: WalletDto;
      let userMockData: WalletDto;
      beforeEach(async () => {
        try {
          walletInfo = await service.createWallet(user);
        } catch (e) {
          logger.error(e?.message, e);
          expect(logger.error).toHaveBeenCalledWith(e?.message, e);
          if (e?.response?.statusCode !== 500) {
            expect(e).toBeInstanceOf(BadRequestException);
          } else {
            expect(e).toBeInstanceOf(InternalServerErrorException);
          }
        }
      });

      it('it should call findOne from walletRepository', async () => {
        let wallet: WalletEntity;
        jest
          .spyOn(walletRepository, 'findOne')
          .mockImplementation(async () => wallet);
        const walletData = await walletRepository.findOne({ user });
        expect(walletRepository.findOne).toBeCalledWith({ user });
        expect(walletData).toStrictEqual(wallet);
      });

      it('it should call log the error and return if wallet is already present', async () => {
        const wallet = {
          id: '7665b517-85c4-4a16-8e6a-f3a110424b0f',
          pathIndex: 0,
          walletAddress: '0x0C20D354cE1B6b05f9A60fa70Cb99285deC77dF2',
          balance: 0,
          isDeleted: false,
        };
        jest.spyOn(service, 'createWallet').mockImplementation();
        await service.createWallet(user);
        if (wallet !== undefined) {
          expect(service.createWallet).toBeCalledWith(user);
          logger.error(
            'Error while creating a wallet: User already has a wallet',
          );
          expect(logger.error).toHaveBeenCalledWith(
            'Error while creating a wallet: User already has a wallet',
          );
        }
      });

      it('it should call find from walletRepository to fetch latest path', async () => {
        let wallet: WalletEntity[];
        jest
          .spyOn(walletRepository, 'find')
          .mockImplementation(async () => wallet);
        const walletData = await walletRepository.find({
          order: { pathIndex: 'DESC' },
          take: 1,
        });
        expect(walletRepository.find).toBeCalledWith({
          order: { pathIndex: 'DESC' },
          take: 1,
        });
        expect(walletData).toStrictEqual(wallet);
      });

      it('it should return', () => {
        expect(walletInfo).toStrictEqual(userMockData);
      });
    });
  });
});
