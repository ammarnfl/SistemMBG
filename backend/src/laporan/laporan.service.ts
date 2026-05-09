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

@Injectable()
export class LaporanService {
  constructor(private readonly prisma: PrismaService) {}

  async laporanDistribusi(
    userId: string,
    userRole: string,
    tanggalAwal?: string,
    tanggalAkhir?: string,
  ): Promise<string> {
    const where: any = {};

    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) where.dapurId = profile.dapurId;
    }

    if (tanggalAwal) {
      const d = new Date(tanggalAwal);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = { ...where.tanggal, gte: d };
    }
    if (tanggalAkhir) {
      const d = new Date(tanggalAkhir);
      d.setUTCHours(23, 59, 59, 999);
      where.tanggal = { ...where.tanggal, lte: d };
    }

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
      const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
      if (profile?.sekolahId) {
        where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId: profile.sekolahId } };
      }
    } else if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) where.distribusi = { dapurId: profile.dapurId };
    }

    if (tanggalAwal) {
      const d = new Date(tanggalAwal);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = { ...where.tanggal, gte: d };
    }
    if (tanggalAkhir) {
      const d = new Date(tanggalAkhir);
      d.setUTCHours(23, 59, 59, 999);
      where.tanggal = { ...where.tanggal, lte: d };
    }

    const data = await this.prisma.evaluasiHarian.findMany({
      where,
      include: {
        penerimaManfaat: { select: { name: true, email: true } },
        distribusi: { include: { sekolah: { select: { nama: true } }, menu: { select: { nama: true } } } },
        penilaianKomponen: { include: { komponen: { select: { nama: true } } } },
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
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) evalWhere.distribusi = { dapurId: profile.dapurId };
    }

    if (tanggalAwal) {
      const d = new Date(tanggalAwal);
      d.setUTCHours(0, 0, 0, 0);
      evalWhere.tanggal = { ...evalWhere.tanggal, gte: d };
    }
    if (tanggalAkhir) {
      const d = new Date(tanggalAkhir);
      d.setUTCHours(23, 59, 59, 999);
      evalWhere.tanggal = { ...evalWhere.tanggal, lte: d };
    }

    const data = await this.prisma.penilaianKomponen.findMany({
      where: { evaluasi: evalWhere },
      include: {
        komponen: { select: { nama: true } },
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
      p.komponen.nama,
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
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) where.distribusi = { dapurId: profile.dapurId };
    } else if (userRole === 'GURU') {
      const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
      if (profile?.sekolahId) {
        where.penerimaManfaat = { penerimaManfaatProfile: { sekolahId: profile.sekolahId } };
      }
    }

    if (tanggalAwal) {
      const d = new Date(tanggalAwal);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = { ...where.tanggal, gte: d };
    }
    if (tanggalAkhir) {
      const d = new Date(tanggalAkhir);
      d.setUTCHours(23, 59, 59, 999);
      where.tanggal = { ...where.tanggal, lte: d };
    }

    const data = await this.prisma.evaluasiHarian.findMany({
      where,
      include: {
        penerimaManfaat: { select: { name: true } },
        distribusi: { include: { sekolah: { select: { nama: true } } } },
      },
      orderBy: { tanggal: 'desc' },
    });

    const headers = ['ID', 'Tanggal', 'Penerima Manfaat', 'Sekolah', 'Rating', 'Feedback', 'Foto URL'];
    const rows = data.map((e) => [
      e.id,
      new Date(e.tanggal).toISOString().slice(0, 10),
      e.penerimaManfaat.name,
      e.distribusi?.sekolah?.nama || '-',
      e.ratingKeseluruhan ?? '',
      e.feedback || '',
      e.fotoUrl || '',
    ]);

    return toCsv(headers, rows);
  }
}
