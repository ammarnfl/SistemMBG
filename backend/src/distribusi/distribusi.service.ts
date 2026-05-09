import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDistribusiDto } from './dto/create-distribusi.dto';
import { UpdateStatusDto, KonfirmasiDistribusiDto } from './dto/update-status.dto';

@Injectable()
export class DistribusiService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDistribusiDto) {
    const tanggal = new Date(dto.tanggal);
    tanggal.setHours(0, 0, 0, 0);

    let dapurId = dto.dapurId;

    if (!dapurId) {
      // Try to resolve dapurId from the user's TimDapurProfile
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      dapurId = profile?.dapurId ?? undefined;
    }

    if (!dapurId) {
      throw new ForbiddenException(
        'User belum dipetakan ke Dapur manapun. ' +
        'Minta Admin untuk memetakan akun Anda ke Dapur, ' +
        'atau sertakan dapurId secara eksplisit dalam permintaan.'
      );
    }

    // Upsert TimDapurProfile so future calls resolve the dapurId automatically.
    // This is a self-healing step for users whose profile wasn't created by the seed.
    await this.prisma.timDapurProfile.upsert({
      where: { userId },
      update: { dapurId },
      create: { userId, dapurId },
    });

    const data: any = {
      tanggal,
      sekolahId: dto.sekolahId,
      dapurId,
      jumlahPorsi: dto.jumlahPorsi,
      status: dto.status || 'DRAFT',
      catatanDapur: dto.catatanDapur,
      createdById: userId,
    };
    if (dto.menuId) data.menuId = dto.menuId;

    return this.prisma.distribusi.create({ data });
  }

  async createBatch(userId: string, items: CreateDistribusiDto[]) {
    // We execute them sequentially for simplicity and individual validation mapping
    const results = [];
    for (const dto of items) {
      const res = await this.create(userId, dto);
      results.push(res);
    }
    return results;
  }

  async findAll(userId: string, filters: { dapurId?: string, tanggal?: string }, userRole?: string) {
    const where: any = {};
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) where.dapurId = profile.dapurId;
    } else if (filters.dapurId) {
      where.dapurId = filters.dapurId;
    }

    if (filters.tanggal) {
      const d = new Date(filters.tanggal);
      d.setHours(0,0,0,0);
      where.tanggal = d;
    }
    return this.prisma.distribusi.findMany({
      where,
      include: { sekolah: true, dapur: true, menu: true, userCreated: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByGuru(userId: string, tanggalFilter?: string) {
    // Find guru profile to get sekolahId
    const profile = await this.prisma.guruProfile.findUnique({
      where: { userId },
    });
    if (!profile || !profile.sekolahId) {
      throw new ForbiddenException('Guru belum dipetakan ke sekolah');
    }

    const where: any = { sekolahId: profile.sekolahId };
    if (tanggalFilter) {
      const d = new Date(tanggalFilter);
      d.setHours(0,0,0,0);
      where.tanggal = d;
    }

    return this.prisma.distribusi.findMany({
      where,
      include: { dapur: true, sekolah: true },
      orderBy: { tanggal: 'desc' },
    });
  }

  async findOne(id: string) {
    const data = await this.prisma.distribusi.findUnique({
      where: { id },
      include: { sekolah: true, dapur: true }
    });
    if (!data) throw new NotFoundException('Distribusi not found');
    return data;
  }

  async updateStatusDapur(id: string, dto: UpdateStatusDto) {
    return this.prisma.distribusi.update({
      where: { id },
      data: { status: dto.status }
    });
  }

  async konfirmasiGuru(id: string, userId: string, dto: KonfirmasiDistribusiDto) {
    // find first and verify ownership
    const dist = await this.findOne(id);
    const profile = await this.prisma.guruProfile.findUnique({ where: { userId }});
    if (!profile || profile.sekolahId !== dist.sekolahId) {
      throw new ForbiddenException('Bukan distribusi untuk sekolah anda');
    }

    return this.prisma.distribusi.update({
      where: { id },
      data: {
        status: dto.status,
        catatanGuru: dto.catatanGuru,
        confirmedById: userId
      }
    });
  }
}
