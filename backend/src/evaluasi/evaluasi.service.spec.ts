import { Test, TestingModule } from '@nestjs/testing';
import { EvaluasiService } from './evaluasi.service';

describe('EvaluasiService', () => {
  let service: EvaluasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvaluasiService],
    }).compile();

    service = module.get<EvaluasiService>(EvaluasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
