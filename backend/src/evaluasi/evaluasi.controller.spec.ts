import { Test, TestingModule } from '@nestjs/testing';
import { EvaluasiController } from './evaluasi.controller';

describe('EvaluasiController', () => {
  let controller: EvaluasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluasiController],
    }).compile();

    controller = module.get<EvaluasiController>(EvaluasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
