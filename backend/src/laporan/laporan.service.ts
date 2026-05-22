import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Simple CSV builder helper */
function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(','), ...rows.map((row) => row.map(escape).join(','))];
  return lines.join('\n');
}

function buildDateFilter(tanggalAwal?: string, tanggalAkhir?: string): any {
  const filter: any = {};
  if (tanggalAwal) {
    const d = new Date(tanggalAwal);
    d.setUTCHours(0, 0, 0, 0);
    filter.gte = d;
  }
  if (tanggalAkhir) {
    const d = new Date(tanggalAkhir);
    d.setUTCHours(23, 59, 59, 999);
    filter.lte = d;
  }
  return Object.keys(filter).length ? filter : undefined;
}

@Injectable()
export class LaporanService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Helper: get dapur / sekolah id by role ─────────────────────────────

  private async getDapurId(userId: string): Promise<string | null> {
    const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
    return profile?.dapurId ?? null;
  }

  private async getSekolahId(userId: string): Promise<string | null> {
    const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
    return profile?.sekolahId ?? null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // JSON DATA ENDPOINTS (for table UI)
  // ══════════════════════════════════════════════════════════════════════════

  async distribusiData(
    userId: string,
    userRole: string,
    opts: { page?: number; search?: string; tanggalAwal?: string; tanggalAkhir?: string; sekolahId?: string; status?: string },
  ) {
    const page = opts.page || 1;
    const pageSize = 10;
    const where: any = {};

    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.dapurId = dapurId;
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.sekolahId = sekolahId;
    }

    const dateFilter = buildDateFilter(opts.tanggalAwal, opts.tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;
    if (opts.sekolahId && userRole === 'ADMIN') where.sekolahId = opts.sekolahId;
    if (opts.status) where.status = opts.status;

    if (opts.search) {
      where.OR = [
        { sekolah: { nama: { contains: opts.search, mode: 'insensitive' } } },
        { dapur: { nama: { contains: opts.search, mode: 'insensitive' } } },
        { menu: { nama: { contains: opts.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.distribusi.count({ where }),
      this.prisma.distribusi.findMany({
        where,
        include: {
          sekolah: { select: { nama: true } },
          dapur: { select: { nama: true } },
          menu: { select: { nama: true } },
          userCreated: { select: { name: true } },
        },
        orderBy: { tanggal: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async evaluasiData(
    userId: string,
    userRole: string,
    opts: { page?: number; search?: string; tanggalAwal?: string; tanggalAkhir?: string; sekolahId?: string },
  ) {
    const page = opts.page || 1;
    const pageSize = 10;
    const where: any = {};

    if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    } else if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.distribusi = { dapurId };
    }

    if (opts.sekolahId && userRole === 'ADMIN') {
      where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId: opts.sekolahId } };
    }

    const dateFilter = buildDateFilter(opts.tanggalAwal, opts.tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;

    if (opts.search) {
      where.OR = [
        { penerimaManfaat: { name: { contains: opts.search, mode: 'insensitive' } } },
        { distribusi: { sekolah: { nama: { contains: opts.search, mode: 'insensitive' } } } },
        { distribusi: { menu: { nama: { contains: opts.search, mode: 'insensitive' } } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.evaluasiHarian.count({ where }),
      this.prisma.evaluasiHarian.findMany({
        where,
        include: {
          penerimaManfaat: { select: { name: true, email: true } },
          distribusi: {
            include: {
              sekolah: { select: { nama: true } },
              menu: { select: { nama: true } },
            },
          },
          penilaianKomponen: { include: { komponen: { select: { namaSnapshot: true } } } },
        },
        orderBy: { tanggal: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async komponenData(
    userId: string,
    userRole: string,
    opts: { page?: number; search?: string; tanggalAwal?: string; tanggalAkhir?: string; sekolahId?: string },
  ) {
    const page = opts.page || 1;
    const pageSize = 10;
    const evalWhere: any = {};

    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) evalWhere.distribusi = { dapurId };
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) evalWhere.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    }

    if (opts.sekolahId && userRole === 'ADMIN') {
      evalWhere.penerimaManfaat = { penerimaManfaatProfile: { sekolahId: opts.sekolahId } };
    }

    const dateFilter = buildDateFilter(opts.tanggalAwal, opts.tanggalAkhir);
    if (dateFilter) evalWhere.tanggal = dateFilter;

    const penilaianWhere: any = { evaluasi: evalWhere };

    if (opts.search) {
      penilaianWhere.OR = [
        { komponen: { namaSnapshot: { contains: opts.search, mode: 'insensitive' } } },
        { evaluasi: { distribusi: { sekolah: { nama: { contains: opts.search, mode: 'insensitive' } } } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.penilaianKomponen.count({ where: penilaianWhere }),
      this.prisma.penilaianKomponen.findMany({
        where: penilaianWhere,
        include: {
          komponen: { select: { namaSnapshot: true, komponenMaster: { select: { nama: true } } } },
          evaluasi: {
            select: {
              tanggal: true,
              penerimaManfaat: { select: { name: true } },
              distribusi: { include: { sekolah: { select: { nama: true } }, menu: { select: { nama: true } } } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async feedbackData(
    userId: string,
    userRole: string,
    opts: { page?: number; search?: string; tanggalAwal?: string; tanggalAkhir?: string; sekolahId?: string },
  ) {
    const page = opts.page || 1;
    const pageSize = 10;
    const where: any = { feedback: { not: null } };

    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.distribusi = { dapurId };
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    }

    if (opts.sekolahId && userRole === 'ADMIN') {
      where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId: opts.sekolahId } };
    }

    const dateFilter = buildDateFilter(opts.tanggalAwal, opts.tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;

    if (opts.search) {
      where.OR = [
        { penerimaManfaat: { name: { contains: opts.search, mode: 'insensitive' } } },
        { feedback: { contains: opts.search, mode: 'insensitive' } },
        { distribusi: { sekolah: { nama: { contains: opts.search, mode: 'insensitive' } } } },
        { distribusi: { menu: { nama: { contains: opts.search, mode: 'insensitive' } } } },
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
              sekolah: { select: { nama: true } },
              menu: { select: { nama: true } },
              dapur: { select: { nama: true } },
            },
          },
        },
        orderBy: { tanggal: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // Get last sentimen refresh timestamp
    const lastRefresh = await this.prisma.evaluasiHarian.findFirst({
      where: { sentimenAnalyzedAt: { not: null } },
      orderBy: { sentimenAnalyzedAt: 'desc' },
      select: { sentimenAnalyzedAt: true },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      lastSentimenRefresh: lastRefresh?.sentimenAnalyzedAt ?? null,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CSV EXPORT ENDPOINTS (kept for backward compatibility)
  // ══════════════════════════════════════════════════════════════════════════

  async laporanDistribusi(
    userId: string,
    userRole: string,
    tanggalAwal?: string,
    tanggalAkhir?: string,
  ): Promise<string> {
    const result = await this.distribusiData(userId, userRole, {
      tanggalAwal, tanggalAkhir, page: 1,
    });
    // Fetch ALL for export (no pagination)
    const where: any = {};
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.dapurId = dapurId;
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.sekolahId = sekolahId;
    }
    const dateFilter = buildDateFilter(tanggalAwal, tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;

    const data = await this.prisma.distribusi.findMany({
      where,
      include: { sekolah: true, dapur: true, menu: true, userCreated: { select: { name: true } } },
      orderBy: { tanggal: 'desc' },
    });

    const headers = ['ID', 'Tanggal', 'Dapur', 'Sekolah', 'Menu', 'Jumlah Porsi', 'Status', 'Catatan Dapur', 'Catatan Guru', 'Dibuat Oleh'];
    const rows = data.map((d) => [
      d.id,
      new Date(d.tanggal).toISOString().slice(0, 10),
      d.dapur.nama,
      d.sekolah.nama,
      d.menu?.nama || '-',
      d.jumlahPorsi,
      d.status,
      d.catatanDapur || '',
      d.catatanGuru || '',
      d.userCreated.name,
    ]);

    return toCsv(headers, rows);
  }

  async laporanEvaluasi(
    userId: string,
    userRole: string,
    tanggalAwal?: string,
    tanggalAkhir?: string,
  ): Promise<string> {
    const where: any = {};
    if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    } else if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.distribusi = { dapurId };
    }
    const dateFilter = buildDateFilter(tanggalAwal, tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;

    const data = await this.prisma.evaluasiHarian.findMany({
      where,
      include: {
        penerimaManfaat: { select: { name: true, email: true } },
        distribusi: { include: { sekolah: { select: { nama: true } }, menu: { select: { nama: true } } } },
        penilaianKomponen: { include: { komponen: { select: { namaSnapshot: true } } } },
      },
      orderBy: { tanggal: 'desc' },
    });

    const headers = ['ID', 'Tanggal', 'Penerima Manfaat', 'Email', 'Sekolah', 'Menu', 'Status Konsumsi', 'Rating Keseluruhan', 'Feedback', 'Foto URL'];
    const rows = data.map((e) => [
      e.id,
      new Date(e.tanggal).toISOString().slice(0, 10),
      e.penerimaManfaat.name,
      e.penerimaManfaat.email,
      e.distribusi?.sekolah?.nama || '-',
      e.distribusi?.menu?.nama || '-',
      e.statusKonsumsi,
      e.ratingKeseluruhan ?? '',
      e.feedback || '',
      e.fotoUrl || '',
    ]);

    return toCsv(headers, rows);
  }

  async laporanKomponen(
    userId: string,
    userRole: string,
    tanggalAwal?: string,
    tanggalAkhir?: string,
  ): Promise<string> {
    const evalWhere: any = {};
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) evalWhere.distribusi = { dapurId };
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) evalWhere.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    }
    const dateFilter = buildDateFilter(tanggalAwal, tanggalAkhir);
    if (dateFilter) evalWhere.tanggal = dateFilter;

    const data = await this.prisma.penilaianKomponen.findMany({
      where: { evaluasi: evalWhere },
      include: {
        komponen: { select: { namaSnapshot: true } },
        evaluasi: {
          select: {
            tanggal: true,
            penerimaManfaat: { select: { name: true } },
            distribusi: { include: { sekolah: { select: { nama: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Tanggal', 'Penerima Manfaat', 'Sekolah', 'Komponen Menu', 'Skor Keterhabisan'];
    const rows = data.map((p) => [
      p.id,
      new Date(p.evaluasi.tanggal).toISOString().slice(0, 10),
      p.evaluasi.penerimaManfaat.name,
      p.evaluasi.distribusi?.sekolah?.nama || '-',
      p.komponen.namaSnapshot,
      p.skorKeterhabisan,
    ]);

    return toCsv(headers, rows);
  }

  async laporanFeedback(
    userId: string,
    userRole: string,
    tanggalAwal?: string,
    tanggalAkhir?: string,
  ): Promise<string> {
    const where: any = { feedback: { not: null } };
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.distribusi = { dapurId };
    } else if (userRole === 'GURU') {
      const sekolahId = await this.getSekolahId(userId);
      if (sekolahId) where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId } };
    }
    const dateFilter = buildDateFilter(tanggalAwal, tanggalAkhir);
    if (dateFilter) where.tanggal = dateFilter;

    const data = await this.prisma.evaluasiHarian.findMany({
      where,
      include: {
        penerimaManfaat: { select: { name: true } },
        distribusi: { include: { sekolah: { select: { nama: true } } } },
      },
      orderBy: { tanggal: 'desc' },
    });

    const sentimenText = (s: string | null) => {
      if (s === 'POSITIF') return 'Positif';
      if (s === 'NEGATIF') return 'Negatif';
      if (s === 'NETRAL') return 'Netral';
      return '';
    };

    const headers = ['ID', 'Tanggal', 'Penerima Manfaat', 'Sekolah', 'Rating', 'Sentimen', 'Skor Sentimen', 'Feedback', 'Foto URL'];
    const rows = data.map((e) => [
      e.id,
      new Date(e.tanggal).toISOString().slice(0, 10),
      e.penerimaManfaat.name,
      e.distribusi?.sekolah?.nama || '-',
      e.ratingKeseluruhan ?? '',
      sentimenText(e.sentimen),
      e.sentimenSkor != null ? e.sentimenSkor.toFixed(3) : '',
      e.feedback || '',
      e.fotoUrl || '',
    ]);

    return toCsv(headers, rows);
  }
}
