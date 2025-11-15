import { Test, TestingModule } from '@nestjs/testing';
import { InsuredService } from './insured.service';

describe('InsuredService', () => {
  let service: InsuredService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsuredService],
    }).compile();

    service = module.get<InsuredService>(InsuredService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
