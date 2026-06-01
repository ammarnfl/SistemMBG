import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObservasiDto } from './dto/create-observasi.dto';
import { categorize } from '../kategori/kategori.service';

interface ListFilters {
  distribusiId?: string;
  tanggal?: string;
  sekolahId?: string;
}

@Injectable()
export class ObservasiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateObservasiDto) {
    const profile = await this.prisma.guruProfile.findUnique({ where: { userId } });
    if (!profile?.sekolahId) {
      throw new ForbiddenException(
        'Akun guru Anda belum dipetakan ke sekolah. Hubungi Admin.',
      );
    }

    let tanggal: Date;
    let sekolahId = profile.sekolahId;
    let distribusiId: string | null = null;

    if (dto.distribusiId) {
      const distribusi = await this.prisma.distribusi.findUnique({
        where: { id: dto.distribusiId },
      });
      if (!distribusi) throw new BadRequestException('Distribusi tidak ditemukan');
      if (distribusi.sekolahId !== profile.sekolahId) {
        throw new ForbiddenException('Distribusi ini bukan untuk sekolah Anda.');
      }
      tanggal = distribusi.tanggal;
      sekolahId = distribusi.sekolahId;
      distribusiId = distribusi.id;
    } else if (dto.tanggal) {
      const d = new Date(dto.tanggal);
      d.setUTCHours(0, 0, 0, 0);
      tanggal = d;
      // Auto-link ke distribusi sekolah pada tanggal itu bila ada
      // (kombinasi sekolah + tanggal sudah unik, lihat constraint Distribusi).
      const distribusi = await this.prisma.distribusi.findFirst({
        where: { sekolahId, tanggal },
        select: { id: true },
      });
      distribusiId = distribusi?.id ?? null;
    } else {
      throw new BadRequestException('Sertakan distribusiId atau tanggal.');
    }

    const kategori = categorize(dto.isi);

    return this.prisma.observasiGuru.create({
      data: { guruId: userId, sekolahId, distribusiId, tanggal, isi: dto.isi, kategori },
    });
  }

  async list(userId: string, role: string, filters: ListFilters) {
    const where: any = {};

    if (role === 'GURU') {
      where.guruId = userId;
    } else if (role === 'TIM_DAPUR') {
      const dapurProfile = await this.prisma.timDapurProfile.findUnique({
        where: { userId },
      });
      if (!dapurProfile?.dapurId) {
        throw new ForbiddenException(
          'Akun Anda belum dipetakan ke Dapur. Hubungi Admin.',
        );
      }
      where.sekolah = { dapurId: dapurProfile.dapurId };
    }
    // ADMIN: tanpa scoping.

    if (filters.distribusiId) where.distribusiId = filters.distribusiId;
    if (filters.sekolahId) where.sekolahId = filters.sekolahId;
    if (filters.tanggal) {
      const d = new Date(filters.tanggal);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = d;
    }

    return this.prisma.observasiGuru.findMany({
      where,
      include: {
        guru: { select: { name: true } },
        sekolah: { select: { id: true, nama: true } },
        distribusi: { select: { id: true, menu: { select: { nama: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async remove(userId: string, id: string) {
    const obs = await this.prisma.observasiGuru.findUnique({ where: { id } });
    if (!obs) throw new NotFoundException('Observasi tidak ditemukan');
    if (obs.guruId !== userId) {
      throw new ForbiddenException(
        'Anda hanya dapat menghapus observasi milik sendiri.',
      );
    }
    await this.prisma.observasiGuru.delete({ where: { id } });
    return { success: true };
  }
}
