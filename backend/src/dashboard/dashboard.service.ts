import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin: total users, dapur, sekolah, active mappings */
  async getAdminStats() {
    const [
      totalUser,
      totalDapur,
      totalSekolah,
      totalKelas,
      mappingDapurSekolah,
      mappingGuruSekolah,
      mappingPMSekolah,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.dapur.count(),
      this.prisma.sekolah.count(),
      this.prisma.kelas.count(),
      this.prisma.sekolah.count({ where: { dapurId: { not: null } } }),
      this.prisma.guruProfile.count({ where: { sekolahId: { not: null } } }),
      this.prisma.penerimaManfaatProfile.count({ where: { sekolahId: { not: null } } }),
    ]);

    // User breakdown per role
    const roleCounts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
      where: { isActive: true },
    });

    const roleMap: Record<string, number> = {};
    roleCounts.forEach((r) => (roleMap[r.role] = r._count._all));

    return {
      totalUser,
      totalDapur,
      totalSekolah,
      totalKelas,
      mappingDapurSekolah,
      mappingGuruSekolah,
      mappingPMSekolah,
      userPerRole: {
        ADMIN: roleMap['ADMIN'] || 0,
        TIM_DAPUR: roleMap['TIM_DAPUR'] || 0,
        GURU: roleMap['GURU'] || 0,
        PENERIMA_MANFAAT: roleMap['PENERIMA_MANFAAT'] || 0,
      },
    };
  }

  /** Tim Dapur: distribusi stats, average rating, komponen terendah, feedback terbaru */
  async getDapurStats(userId: string, tanggalAwal?: string, tanggalAkhir?: string) {
    // Find dapur of this tim dapur user
    const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
    const dapurId = profile?.dapurId ?? undefined;

    const dateFilter: any = {};
    if (tanggalAwal) {
      const d = new Date(tanggalAwal);
      d.setUTCHours(0, 0, 0, 0);
      dateFilter.gte = d;
    }
    if (tanggalAkhir) {
      const d = new Date(tanggalAkhir);
      d.setUTCHours(23, 59, 59, 999);
      dateFilter.lte = d;
    }

    const distribusiWhere: any = {};
    if (dapurId) distribusiWhere.dapurId = dapurId;
    if (Object.keys(dateFilter).length) distribusiWhere.tanggal = dateFilter;

    const evalWhere: any = {};
    if (Object.keys(dateFilter).length) evalWhere.tanggal = dateFilter;
    // Link evaluasi back to distribusi for the dapur filter
    if (dapurId) evalWhere.distribusi = { dapurId };

    const [
      totalDistribusi,
      totalEvaluasi,
      ratingAggregate,
      feedbackTerbaru,
    ] = await Promise.all([
      this.prisma.distribusi.count({ where: distribusiWhere }),
      this.prisma.evaluasiHarian.count({ where: evalWhere }),
      this.prisma.evaluasiHarian.aggregate({
        where: { ...evalWhere, ratingKeseluruhan: { not: null } },
        _avg: { ratingKeseluruhan: true },
      }),
      this.prisma.evaluasiHarian.findMany({
        where: { ...evalWhere, feedback: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          penerimaManfaat: { select: { name: true } },
          distribusi: { include: { sekolah: { select: { nama: true } } } },
        },
      }),
    ]);

    // Komponen dengan skor keterhabisan terendah
    const komponenStats = await this.prisma.penilaianKomponen.groupBy({
      by: ['komponenId'],
      where: evalWhere
        ? { evaluasi: evalWhere }
        : {},
      _avg: { skorKeterhabisan: true },
      orderBy: { _avg: { skorKeterhabisan: 'asc' } },
      take: 5,
    });

    const komponenIds = komponenStats.map((k) => k.komponenId);
    const komponenDetails = komponenIds.length
      ? await this.prisma.menuKomponen.findMany({ where: { id: { in: komponenIds } } })
      : [];

    const komponenSering = komponenStats.map((k) => {
      const detail = komponenDetails.find((d) => d.id === k.komponenId);
      return {
        komponenId: k.komponenId,
        nama: detail?.namaSnapshot || 'Unknown',
        rataKeterhabisan: k._avg.skorKeterhabisan
          ? Number(k._avg.skorKeterhabisan.toFixed(2))
          : null,
      };
    });

    // Distribusi per status
    const distribusiByStatus = await this.prisma.distribusi.groupBy({
      by: ['status'],
      where: distribusiWhere,
      _count: { _all: true },
    });
    const statusMap: Record<string, number> = {};
    distribusiByStatus.forEach((s) => (statusMap[s.status] = s._count._all));

    return {
      totalDistribusi,
      totalEvaluasi,
      rataRatingKeseluruhan: ratingAggregate._avg.ratingKeseluruhan
        ? Number(ratingAggregate._avg.ratingKeseluruhan.toFixed(2))
        : null,
      distribusiPerStatus: statusMap,
      komponenSeringTidakHabis: komponenSering,
      feedbackTerbaru: feedbackTerbaru.map((f) => ({
        id: f.id,
        feedback: f.feedback,
        penerimaManfaat: f.penerimaManfaat.name,
        sekolah: f.distribusi?.sekolah?.nama || '-',
        tanggal: f.tanggal,
      })),
    };
  }

  /** Guru: status distribusi sekolahnya, rekapan pengisian hari ini */
  async getGuruStats(userId: string) {
    const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
    const sekolahId = profile?.sekolahId ?? undefined;

    if (!sekolahId) {
      return {
        sekolah: null,
        distribusiHariIni: null,
        sudahIsi: 0,
        belumIsi: 0,
        totalPM: 0,
      };
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [sekolah, distribusiHariIni, totalPM, sudahIsi] = await Promise.all([
      this.prisma.sekolah.findUnique({ where: { id: sekolahId } }),
      this.prisma.distribusi.findFirst({
        where: { sekolahId, tanggal: today },
        include: {
          menu: {
            include: {
              komponen: { include: { komponenMaster: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.penerimaManfaatProfile.count({ where: { sekolahId } }),
      this.prisma.evaluasiHarian.count({
        where: {
          tanggal: today,
          penerimaManfaat: {
            penerimaManfaatProfile: { sekolahId },
          },
        },
      }),
    ]);

    return {
      sekolah: sekolah ? { id: sekolah.id, nama: sekolah.nama } : null,
      distribusiHariIni: distribusiHariIni
        ? {
            id: distribusiHariIni.id,
            status: distribusiHariIni.status,
            jumlahPorsi: distribusiHariIni.jumlahPorsi,
            tanggal: distribusiHariIni.tanggal,
            menu: distribusiHariIni.menu
              ? {
                  nama: distribusiHariIni.menu.nama,
                  deskripsi: distribusiHariIni.menu.deskripsi,
                  fotoUrl: distribusiHariIni.menu.fotoUrl,
                  energiKkal: distribusiHariIni.menu.energiKkal,
                  proteinGram: distribusiHariIni.menu.proteinGram,
                  lemakGram: distribusiHariIni.menu.lemakGram,
                  karbohidratGram: distribusiHariIni.menu.karbohidratGram,
                  seratGram: distribusiHariIni.menu.seratGram,
                  komponen: distribusiHariIni.menu.komponen.map(k => ({
                    id: k.id,
                    nama: k.namaSnapshot,
                    deskripsi: k.komponenMaster?.deskripsi || null,
                  })),
                }
              : null,
          }
        : null,
      totalPM,
      sudahIsi,
      belumIsi: Math.max(0, totalPM - sudahIsi),
    };
  }

  /** Guru: detail siapa yang sudah/belum isi hari ini */
  async getGuruMonitoring(userId: string) {
    const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
    const sekolahId = profile?.sekolahId;
    if (!sekolahId) return { sudahIsi: [], belumIsi: [] };

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const allPM = await this.prisma.penerimaManfaatProfile.findMany({
      where: { sekolahId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        kelas: { select: { nama: true } },
      },
    });

    const evaluasiHariIni = await this.prisma.evaluasiHarian.findMany({
      where: {
        tanggal: today,
        penerimaManfaatId: { in: allPM.map((p) => p.userId) },
      },
      select: {
        penerimaManfaatId: true,
        statusKonsumsi: true,
        ratingKeseluruhan: true,
      },
    });

    const evalMap = new Map(evaluasiHariIni.map((e) => [e.penerimaManfaatId, e]));

    const sudahIsi = allPM
      .filter((p) => evalMap.has(p.userId))
      .map((p) => ({
        userId: p.userId,
        name: p.user.name,
        kelas: p.kelas?.nama || '-',
        statusKonsumsi: evalMap.get(p.userId)?.statusKonsumsi,
        rating: evalMap.get(p.userId)?.ratingKeseluruhan,
      }));

    const belumIsi = allPM
      .filter((p) => !evalMap.has(p.userId))
      .map((p) => ({
        userId: p.userId,
        name: p.user.name,
        kelas: p.kelas?.nama || '-',
      }));

    return { sudahIsi, belumIsi };
  }

  /** Penerima Manfaat: status hari ini */
  async getPMStats(userId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [evaluasiHariIni, riwayat] = await Promise.all([
      this.prisma.evaluasiHarian.findUnique({
        where: {
          tanggal_penerimaManfaatId: {
            tanggal: today,
            penerimaManfaatId: userId,
          },
        },
        include: {
          penilaianKomponen: { include: { komponen: true } },
        },
      }),
      this.prisma.evaluasiHarian.findMany({
        where: { penerimaManfaatId: userId },
        orderBy: { tanggal: 'desc' },
        take: 7,
        include: { distribusi: { include: { menu: true } } },
      }),
    ]);

    return {
      sudahIsiHariIni: !!evaluasiHariIni,
      evaluasiHariIni: evaluasiHariIni
        ? {
            statusKonsumsi: evaluasiHariIni.statusKonsumsi,
            ratingKeseluruhan: evaluasiHariIni.ratingKeseluruhan,
            feedback: evaluasiHariIni.feedback,
          }
        : null,
      riwayat7Hari: riwayat.map((r) => ({
        tanggal: r.tanggal,
        statusKonsumsi: r.statusKonsumsi,
        rating: r.ratingKeseluruhan,
        namaMenu: r.distribusi?.menu?.nama || '-',
      })),
    };
  }
}
