import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluasiDto } from './dto/create-evaluasi.dto';

@Injectable()
export class EvaluasiService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenuToday(userId: string, dateStr: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { penerimaManfaatProfile: true },
    });

    if (!user || user.role !== 'PENERIMA_MANFAAT') {
      throw new BadRequestException('User bukan penerima manfaat');
    }

    const sekolahId = user.penerimaManfaatProfile?.sekolahId;
    if (!sekolahId) {
      return null;
    }

    // Normalize tanggal ke UTC midnight untuk konsistensi dengan data tersimpan
    const today = new Date(dateStr);
    today.setUTCHours(0, 0, 0, 0);
    
    const distribusi = await this.prisma.distribusi.findFirst({
      where: {
        sekolahId,
        tanggal: today,
        // Tampilkan semua status agar penerima manfaat bisa
        // melihat menu meskipun distribusi masih DRAFT, DIKIRIM, atau BERMASALAH
        status: { in: ['DRAFT', 'DIKIRIM', 'DITERIMA', 'SELESAI', 'BERMASALAH'] },
        // Wajib ada menu yang di-assign
        menuId: { not: null },
      },
      include: {
        menu: {
          include: {
            komponen: true,
          }
        },
        dapur: true,
      }
    });

    if (!distribusi) {
      return null;
    }

    return distribusi;
  }

  async createEvaluasi(userId: string, dto: CreateEvaluasiDto) {
    // 1. Validasi waktu maksimal 7 hari
    const tanggalDistribusi = new Date(dto.tanggal);
    const sekarang = new Date();
    const selisihWaktu = sekarang.getTime() - tanggalDistribusi.getTime();
    const selisihHari = selisihWaktu / (1000 * 3600 * 24);

    if (selisihHari > 7) {
      throw new BadRequestException('Evaluasi sudah melewati batas waktu 7 hari');
    }

    // 1.5 Cek status distribusi
    if (dto.distribusiId) {
      const distribusi = await this.prisma.distribusi.findUnique({
        where: { id: dto.distribusiId }
      });
      if (!distribusi) {
        throw new BadRequestException('Distribusi tidak ditemukan');
      }
      if (distribusi.status !== 'DITERIMA' && distribusi.status !== 'SELESAI' && distribusi.status !== 'BERMASALAH') {
        throw new BadRequestException('Evaluasi belum bisa diisi karena distribusi belum dikonfirmasi atau dilaporkan oleh guru');
      }
    }

    // 2. Cek apakah sudah mengisi evaluasi di hari tersebut
    const existing = await this.prisma.evaluasiHarian.findUnique({
      where: {
        tanggal_penerimaManfaatId: {
          tanggal: tanggalDistribusi,
          penerimaManfaatId: userId,
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Anda sudah mengisi evaluasi untuk tanggal tersebut');
    }

    // 3. Validasi aturan mandatory (Feedback / Foto) jika kondisi tertentu
    if (dto.statusKonsumsi === 'TIDAK_KONSUMSI' || (dto.ratingKeseluruhan && dto.ratingKeseluruhan <= 2) || (dto.penilaianKomponen && dto.penilaianKomponen.some(k => k.skorKeterhabisan <= 2))) {
      if (!dto.feedback && !dto.fotoUrl) {
         throw new BadRequestException('Feedback atau Foto wajib diisi karena rating rendah atau tidak konsumsi');
      }
    }

    // 4. Buat record
    return await this.prisma.evaluasiHarian.create({
      data: {
        tanggal: tanggalDistribusi,
        penerimaManfaatId: userId,
        distribusiId: dto.distribusiId,
        statusKonsumsi: dto.statusKonsumsi,
        ratingKeseluruhan: dto.ratingKeseluruhan,
        feedback: dto.feedback,
        fotoUrl: dto.fotoUrl,
        penilaianKomponen: {
          create: dto.penilaianKomponen?.map(k => ({
            komponenId: k.komponenId,
            skorKeterhabisan: k.skorKeterhabisan,
          })) || []
        }
      },
      include: {
        penilaianKomponen: true,
      }
    });
  }

  async getRiwayat(userId: string) {
    return await this.prisma.evaluasiHarian.findMany({
      where: {
        penerimaManfaatId: userId,
      },
      include: {
        distribusi: {
          include: {
            menu: true,
          }
        },
        penilaianKomponen: {
          include: {
            komponen: true,
          }
        },
        feedbackResolvedBy: {
          select: { name: true },
        },
      },
      orderBy: {
        tanggal: 'desc'
      }
    });
  }
}
