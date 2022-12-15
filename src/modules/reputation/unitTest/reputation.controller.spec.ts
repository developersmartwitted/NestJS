import { Test } from '@nestjs/testing';

import { ReputationController } from '../reputation.controller';

describe('ReputationController', () => {
  let controller: ReputationController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ReputationController],
    }).compile();

    controller = moduleRef.get<ReputationController>(ReputationController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
