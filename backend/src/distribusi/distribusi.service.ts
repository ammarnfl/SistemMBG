import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusDistribusi } from '@prisma/client';
import { CreateDistribusiDto } from './dto/create-distribusi.dto';
import { UpdateStatusDto, KonfirmasiDistribusiDto } from './dto/update-status.dto';

type Actor = 'TIM_DAPUR' | 'GURU';

// Transisi sah per aktor. Sumber kebenaran tunggal untuk state machine Distribusi.
const TRANSITIONS: Record<Actor, Record<StatusDistribusi, StatusDistribusi[]>> = {
  TIM_DAPUR: {
    DRAFT: ['DIKIRIM', 'BERMASALAH'],
    DIKIRIM: [],
    DITERIMA: ['SELESAI'],
    BERMASALAH: ['SELESAI'],
    SELESAI: [],
  },
  GURU: {
    DRAFT: [],
    DIKIRIM: ['DITERIMA', 'BERMASALAH'],
    DITERIMA: ['DIKIRIM', 'BERMASALAH'],
    BERMASALAH: ['DITERIMA'],
    SELESAI: [],
  },
};

export function isValidTransition(
  from: StatusDistribusi,
  to: StatusDistribusi,
  actor: Actor,
): boolean {
  return TRANSITIONS[actor][from]?.includes(to) ?? false;
}

@Injectable()
export class DistribusiService {
  constructor(private prisma: PrismaService) {}

  private assertTransition(
    from: StatusDistribusi,
    to: StatusDistribusi,
    actor: Actor,
  ): void {
    if (from === to) {
      throw new BadRequestException(`Status sudah ${to}, tidak ada perubahan.`);
    }
    if (!isValidTransition(from, to, actor)) {
      throw new BadRequestException(
        `Transisi status ${from} → ${to} tidak diizinkan untuk ${actor}.`,
      );
    }
  }

  /**
   * Bangun data create + lakukan self-heal TimDapurProfile.
   * Dipisah agar bisa dipakai bersama oleh create() dan createBatch().
   */
  private async buildCreateData(userId: string, dto: CreateDistribusiDto) {
    const tanggal = new Date(dto.tanggal);
    tanggal.setUTCHours(0, 0, 0, 0);

    let dapurId = dto.dapurId;
    if (!dapurId) {
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

    // Self-heal TimDapurProfile (idempoten, aman dipanggil berkali-kali).
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
    return data;
  }

  /**
   * Konversi error Prisma yang sudah dikenali menjadi error HTTP yang ramah.
   * Selain itu, lempar ulang apa adanya.
   */
  private rethrowFriendly(err: any): never {
    const target = err?.meta?.target;
    if (
      err?.code === 'P2002' &&
      Array.isArray(target) &&
      target.includes('sekolahId') &&
      target.includes('tanggal')
    ) {
      throw new BadRequestException(
        'Distribusi untuk sekolah ini pada tanggal tersebut sudah ada. Periksa daftar distribusi.',
      );
    }
    throw err;
  }

  async create(userId: string, dto: CreateDistribusiDto) {
    const data = await this.buildCreateData(userId, dto);
    try {
      return await this.prisma.distribusi.create({ data });
    } catch (err) {
      this.rethrowFriendly(err);
    }
  }

  async createBatch(userId: string, items: CreateDistribusiDto[]) {
    // 1. Resolve + validasi semua item dulu (di luar transaksi).
    //    Jika ada item invalid, gagal cepat tanpa menyentuh DB.
    const dataList = [] as Awaited<ReturnType<typeof this.buildCreateData>>[];
    for (const dto of items) {
      dataList.push(await this.buildCreateData(userId, dto));
    }

    // 2. Tulis semua dalam satu transaksi — semua-atau-tidak-ada.
    //    Mencegah half-state ketika item ke-N gagal (mis. duplikat sekolah+tanggal).
    try {
      return await this.prisma.$transaction(
        dataList.map((data) => this.prisma.distribusi.create({ data })),
      );
    } catch (err) {
      this.rethrowFriendly(err);
    }
  }

  async findAll(userId: string, filters: { dapurId?: string, tanggal?: string }, userRole?: string) {
    const where: any = {};
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (!profile?.dapurId) {
        // Tanpa pemetaan ke dapur, jangan kembalikan apa pun — cegah kebocoran lintas-dapur.
        throw new ForbiddenException(
          'Akun Anda belum dipetakan ke Dapur. Hubungi Admin sebelum melihat data distribusi.',
        );
      }
      where.dapurId = profile.dapurId;
    } else if (filters.dapurId) {
      where.dapurId = filters.dapurId;
    }

    if (filters.tanggal) {
      const d = new Date(filters.tanggal);
      d.setUTCHours(0,0,0,0);
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
      d.setUTCHours(0,0,0,0);
      where.tanggal = d;
    }

    return this.prisma.distribusi.findMany({
      where,
      include: {
        dapur: true,
        sekolah: true,
        menu: {
          include: {
            komponen: { include: { komponenMaster: true } },
          },
        },
      },
      orderBy: { tanggal: 'desc' },
    });
  }

  async findOne(id: string) {
    const data = await this.prisma.distribusi.findUnique({
      where: { id },
      include: {
        sekolah: true,
        dapur: true,
        menu: {
          include: {
            komponen: { include: { komponenMaster: true } },
          },
        },
      },
    });
    if (!data) throw new NotFoundException('Distribusi not found');
    return data;
  }

  async updateStatusDapur(id: string, userId: string, userRole: string, dto: UpdateStatusDto) {
    const dist = await this.prisma.distribusi.findUnique({ where: { id } });
    if (!dist) throw new NotFoundException('Distribusi tidak ditemukan');

    // Ownership check: TIM_DAPUR hanya boleh ubah distribusi dapurnya sendiri.
    // ADMIN dilewatkan (boleh override untuk koreksi).
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (!profile?.dapurId) {
        throw new ForbiddenException(
          'Akun Anda belum dipetakan ke Dapur manapun. Hubungi Admin.',
        );
      }
      if (profile.dapurId !== dist.dapurId) {
        throw new ForbiddenException('Distribusi ini bukan milik dapur Anda.');
      }
    }

    this.assertTransition(dist.status, dto.status, 'TIM_DAPUR');

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

    this.assertTransition(dist.status, dto.status, 'GURU');

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
