import { Test, TestingModule } from '@nestjs/testing';
import { InsuredController } from './insured.controller';

describe('InsuredController', () => {
  let controller: InsuredController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuredController],
    }).compile();

    controller = module.get<InsuredController>(InsuredController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
