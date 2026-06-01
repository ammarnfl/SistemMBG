import { Test, TestingModule } from '@nestjs/testing';
import { EvaluasiService } from './evaluasi.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('EvaluasiService', () => {
  let service: EvaluasiService;
  let prismaService: Partial<PrismaService>;

  const mockPMUser = {
    id: 'pm-user-id',
    role: 'PENERIMA_MANFAAT',
    penerimaManfaatProfile: { sekolahId: 'sekolah-1' },
  };

  beforeEach(async () => {
    prismaService = {
      user: { findUnique: jest.fn() } as any,
      distribusi: {
        findFirst: jest.fn(),
        findUnique: jest.fn().mockResolvedValue({
          id: 'dist-1',
          status: 'DITERIMA',
        }),
      } as any,
      evaluasiHarian: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluasiService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<EvaluasiService>(EvaluasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvaluasi - validasi tambahan', () => {
    const baseDto = {
      tanggal: new Date().toISOString().slice(0, 10),
      distribusiId: 'dist-1',
      statusKonsumsi: 'KONSUMSI' as any,
      ratingKeseluruhan: 4,
      penilaianKomponen: [{ komponenId: 'k-1', skorKeterhabisan: 4 }],
    };

    beforeEach(() => {
      (prismaService.evaluasiHarian!.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.evaluasiHarian!.create as jest.Mock).mockResolvedValue({ id: 'eval-1' });
    });

    it('should throw when TIDAK_KONSUMSI without feedback or foto', async () => {
      await expect(
        service.createEvaluasi('pm-user-id', {
          ...baseDto,
          statusKonsumsi: 'TIDAK_KONSUMSI',
          feedback: undefined,
          fotoUrl: undefined,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when rating <= 2 without feedback or foto', async () => {
      await expect(
        service.createEvaluasi('pm-user-id', {
          ...baseDto,
          ratingKeseluruhan: 2,
          feedback: undefined,
          fotoUrl: undefined,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when komponen skor <= 2 without feedback or foto', async () => {
      await expect(
        service.createEvaluasi('pm-user-id', {
          ...baseDto,
          penilaianKomponen: [{ komponenId: 'k-1', skorKeterhabisan: 1 }],
          feedback: undefined,
          fotoUrl: undefined,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow TIDAK_KONSUMSI when feedback is provided', async () => {
      const result = await service.createEvaluasi('pm-user-id', {
        ...baseDto,
        statusKonsumsi: 'TIDAK_KONSUMSI',
        feedback: 'Makanan tidak sesuai selera',
      });
      expect(result).toHaveProperty('id');
    });

    it('should allow low rating when fotoUrl is provided', async () => {
      const result = await service.createEvaluasi('pm-user-id', {
        ...baseDto,
        ratingKeseluruhan: 1,
        fotoUrl: 'https://example.com/foto.jpg',
      });
      expect(result).toHaveProperty('id');
    });

    it('should throw when trying to submit evaluasi twice for same date', async () => {
      (prismaService.evaluasiHarian!.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-eval' });
      await expect(
        service.createEvaluasi('pm-user-id', baseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when evaluasi is older than 7 days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      await expect(
        service.createEvaluasi('pm-user-id', {
          ...baseDto,
          tanggal: oldDate.toISOString().slice(0, 10),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create evaluasi successfully with valid data', async () => {
      const result = await service.createEvaluasi('pm-user-id', {
        ...baseDto,
        ratingKeseluruhan: 5,
      });
      expect(result).toHaveProperty('id');
      expect(prismaService.evaluasiHarian!.create).toHaveBeenCalledTimes(1);
    });
  });
});
