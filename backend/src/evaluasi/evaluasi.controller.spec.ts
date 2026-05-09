import { Test, TestingModule } from '@nestjs/testing';
import { EvaluasiController } from './evaluasi.controller';
import { EvaluasiService } from './evaluasi.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EvaluasiController', () => {
  let controller: EvaluasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluasiController],
      providers: [
        EvaluasiService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            evaluasiHarian: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<EvaluasiController>(EvaluasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
