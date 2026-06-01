import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SentimenLabel } from '@prisma/client';

export interface FeedbackListOpts {
  page?: number;
  search?: string;
  tanggalAwal?: string;
  tanggalAkhir?: string;
  sentimen?: SentimenLabel;
  sekolahId?: string;
  resolved?: string; // 'true' | 'false' | undefined
  kategori?: string; // salah satu dari KATEGORI_LIST
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserFilters(userId: string): Promise<{ dapurId?: string; sekolahId?: string }> {
    const [dapur, guru] = await Promise.all([
      this.prisma.timDapurProfile.findUnique({ where: { userId } }),
      this.prisma.guruProfile.findUnique({ where: { userId } })
    ]);
    return {
      dapurId: dapur?.dapurId ?? undefined,
      sekolahId: guru?.sekolahId ?? undefined
    };
  }

  /**
   * Paginated feedback list for Tim Dapur with comprehensive filters
   */
  async listFeedback(userId: string, opts: FeedbackListOpts) {
    const page = opts.page || 1;
    const pageSize = 10;
    const filters = await this.getUserFilters(userId);

    const where: any = { feedback: { not: null } };
    
    if (filters.dapurId) {
      where.distribusi = { dapurId: filters.dapurId };
    } else if (filters.sekolahId) {
      where.penerimaManfaat = {
        penerimaManfaatProfile: { sekolahId: filters.sekolahId }
      };
    }

    // Date filter
    if (opts.tanggalAwal || opts.tanggalAkhir) {
      const dateFilter: any = {};
      if (opts.tanggalAwal) {
        const d = new Date(opts.tanggalAwal);
        d.setUTCHours(0, 0, 0, 0);
        dateFilter.gte = d;
      }
      if (opts.tanggalAkhir) {
        const d = new Date(opts.tanggalAkhir);
        d.setUTCHours(23, 59, 59, 999);
        dateFilter.lte = d;
      }
      where.tanggal = dateFilter;
    }

    // Sentimen filter
    if (opts.sentimen) {
      where.sentimen = opts.sentimen;
    }

    // School filter
    if (opts.sekolahId) {
      if (where.distribusi) {
        where.distribusi.sekolahId = opts.sekolahId;
      } else {
        where.distribusi = { sekolahId: opts.sekolahId };
      }
    }

    // Resolved filter
    if (opts.resolved === 'true') {
      where.feedbackResolved = true;
    } else if (opts.resolved === 'false') {
      where.feedbackResolved = false;
    }

    // Kategori filter (array field — gunakan `has`)
    if (opts.kategori) {
      where.kategori = { has: opts.kategori };
    }

    // Search by name or feedback text
    if (opts.search) {
      where.OR = [
        { penerimaManfaat: { name: { contains: opts.search, mode: 'insensitive' } } },
        { feedback: { contains: opts.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.evaluasiHarian.count({ where }),
      this.prisma.evaluasiHarian.findMany({
        where,
        include: {
          penerimaManfaat: { select: { name: true } },
          distribusi: {
            include: {
              sekolah: { select: { id: true, nama: true } },
              menu: { select: { nama: true } },
            },
          },
          feedbackResolvedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Get list of schools linked to the dapur for filter dropdown
   */
  async getSekolahList(userId: string) {
    const filters = await this.getUserFilters(userId);
    if (filters.dapurId) {
      return this.prisma.sekolah.findMany({
        where: { dapurId: filters.dapurId },
        select: { id: true, nama: true },
        orderBy: { nama: 'asc' },
      });
    } else if (filters.sekolahId) {
      return this.prisma.sekolah.findMany({
        where: { id: filters.sekolahId },
        select: { id: true, nama: true },
      });
    }
    return [];
  }

  /**
   * Mark a feedback as resolved with the given resolution text
   */
  async resolveFeedback(userId: string, feedbackId: string, resolution: string) {
    const filters = await this.getUserFilters(userId);

    const evaluasi = await this.prisma.evaluasiHarian.findUnique({
      where: { id: feedbackId },
      include: { distribusi: { select: { dapurId: true } } },
    });

    if (!evaluasi) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    // Verify this feedback belongs to the dapur
    if (filters.dapurId && evaluasi.distribusi?.dapurId !== filters.dapurId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke feedback ini');
    }
    // Guru cannot resolve feedback
    if (filters.sekolahId && !filters.dapurId) {
      throw new ForbiddenException('Guru tidak dapat menanggapi feedback');
    }

    return this.prisma.evaluasiHarian.update({
      where: { id: feedbackId },
      data: {
        feedbackResolved: true,
        feedbackResolution: resolution,
        feedbackResolvedAt: new Date(),
        feedbackResolvedById: userId,
      },
      include: {
        penerimaManfaat: { select: { name: true } },
        feedbackResolvedBy: { select: { name: true } },
      },
    });
  }

  /**
   * Get the last time sentimen analysis was run
   */
  async getLastSentimenRefresh() {
    const latest = await this.prisma.evaluasiHarian.findFirst({
      where: { sentimenAnalyzedAt: { not: null } },
      orderBy: { sentimenAnalyzedAt: 'desc' },
      select: { sentimenAnalyzedAt: true },
    });
    return latest?.sentimenAnalyzedAt ?? null;
  }
}
