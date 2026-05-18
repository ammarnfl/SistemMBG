import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateKomponenMasterDto } from './dto/create-komponen-master.dto';
import { UpdateKomponenMasterDto } from './dto/update-komponen-master.dto';
import { SetJadwalDto } from './dto/set-jadwal.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ─── Helper: get dapurId for a TIM_DAPUR user ─────────────────────────────
  private async getDapurId(userId: string): Promise<string | null> {
    const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
    return profile?.dapurId ?? null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // KOMPONEN MASTER CRUD
  // ══════════════════════════════════════════════════════════════════════════

  async findAllKomponenMaster(userId: string, userRole: string) {
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (!dapurId) return [];
      return this.prisma.komponenMaster.findMany({
        where: { dapurId },
        orderBy: { nama: 'asc' },
      });
    }
    if (userRole === 'ADMIN') {
      return this.prisma.komponenMaster.findMany({
        include: { dapur: { select: { nama: true } } },
        orderBy: [{ dapurId: 'asc' }, { nama: 'asc' }],
      });
    }
    return [];
  }

  async createKomponenMaster(userId: string, dto: CreateKomponenMasterDto) {
    const trimmedNama = dto.nama.trim();
    if (!trimmedNama) throw new BadRequestException('Nama komponen tidak boleh hanya spasi');

    const dapurId = await this.getDapurId(userId);
    if (!dapurId) throw new ForbiddenException('Akun Anda belum terhubung ke dapur');

    // Check duplicate within same dapur
    const existing = await this.prisma.komponenMaster.findUnique({
      where: { dapurId_nama: { dapurId, nama: trimmedNama } },
    });
    if (existing) throw new ConflictException(`Komponen "${trimmedNama}" sudah ada di dapur ini`);

    return this.prisma.komponenMaster.create({
      data: { dapurId, nama: trimmedNama, deskripsi: dto.deskripsi },
    });
  }

  async updateKomponenMaster(id: string, userId: string, dto: UpdateKomponenMasterDto) {
    const komponen = await this.prisma.komponenMaster.findUnique({ where: { id } });
    if (!komponen) throw new NotFoundException('Komponen tidak ditemukan');

    const dapurId = await this.getDapurId(userId);
    if (komponen.dapurId !== dapurId) throw new ForbiddenException('Bukan komponen dapur Anda');

    if (dto.nama !== undefined) {
      const trimmedNama = dto.nama.trim();
      if (!trimmedNama) throw new BadRequestException('Nama komponen tidak boleh hanya spasi');

      if (trimmedNama !== komponen.nama) {
        const duplicate = await this.prisma.komponenMaster.findUnique({
          where: { dapurId_nama: { dapurId: komponen.dapurId, nama: trimmedNama } },
        });
        if (duplicate) throw new ConflictException(`Komponen "${trimmedNama}" sudah ada di dapur ini`);
      }
      dto = { ...dto, nama: trimmedNama };
    }

    return this.prisma.komponenMaster.update({ where: { id }, data: dto });
  }

  async deleteKomponenMaster(id: string, userId: string) {
    const komponen = await this.prisma.komponenMaster.findUnique({ where: { id } });
    if (!komponen) throw new NotFoundException('Komponen tidak ditemukan');

    const dapurId = await this.getDapurId(userId);
    if (komponen.dapurId !== dapurId) throw new ForbiddenException('Bukan komponen dapur Anda');

    // Check if used by any menu
    const usage = await this.prisma.menuKomponen.count({ where: { komponenMasterId: id } });
    if (usage > 0) {
      throw new BadRequestException(`Komponen ini digunakan oleh ${usage} menu, hapus relasi menu dulu`);
    }

    return this.prisma.komponenMaster.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MENU MASTER CRUD
  // ══════════════════════════════════════════════════════════════════════════

  async create(userId: string, dto: CreateMenuDto, userRole: string) {
    const trimmedNama = dto.nama?.trim();
    if (!trimmedNama) throw new BadRequestException('Nama menu wajib diisi');

    if (dto.komponenIds && dto.komponenIds.length === 0) {
      throw new BadRequestException('Menu harus memiliki minimal 1 komponen');
    }

    let dapurId: string | null = null;
    if (userRole === 'TIM_DAPUR') {
      dapurId = await this.getDapurId(userId);
    }

    // Validate komponenIds belong to same dapur
    if (dto.komponenIds && dto.komponenIds.length > 0 && dapurId) {
      const komponents = await this.prisma.komponenMaster.findMany({
        where: { id: { in: dto.komponenIds }, dapurId },
      });
      if (komponents.length !== dto.komponenIds.length) {
        throw new BadRequestException('Beberapa komponen tidak ditemukan atau bukan milik dapur Anda');
      }
    }

    const { komponenIds, ...menuData } = dto;
    const data: any = { ...menuData, nama: trimmedNama };
    if (dapurId) data.dapurId = dapurId;

    if (komponenIds && komponenIds.length > 0) {
      // Build komponen snapshots
      const komponentList = await this.prisma.komponenMaster.findMany({
        where: { id: { in: komponenIds } },
        select: { id: true, nama: true },
      });
      data.komponen = {
        create: komponentList.map((k) => ({
          komponenMasterId: k.id,
          namaSnapshot: k.nama,
        })),
      };
    }

    return this.prisma.menuMaster.create({
      data,
      include: {
        komponen: { include: { komponenMaster: true } },
        dapur: { select: { nama: true } },
      },
    });
  }

  async findAll(userId: string, userRole: string) {
    const where: any = {};
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.dapurId = dapurId;
    }
    return this.prisma.menuMaster.findMany({
      where,
      include: {
        komponen: { include: { komponenMaster: true } },
        dapur: { select: { nama: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menuMaster.findUnique({
      where: { id },
      include: {
        komponen: { include: { komponenMaster: true } },
        dapur: { select: { nama: true } },
      },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return menu;
  }

  async update(id: string, userId: string, dto: UpdateMenuDto, userRole: string) {
    const menu = await this.findOne(id);

    // Ownership check for TIM_DAPUR
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (menu.dapurId !== dapurId) throw new ForbiddenException('Bukan menu dapur Anda');
    }

    if (dto.nama !== undefined) {
      const trimmedNama = dto.nama.trim();
      if (!trimmedNama) throw new BadRequestException('Nama menu wajib diisi');
      dto = { ...dto, nama: trimmedNama };
    }

    const { komponenIds, ...menuData } = dto;

    // If komponenIds provided, replace all komponen
    if (komponenIds !== undefined) {
      if (komponenIds.length === 0) throw new BadRequestException('Menu harus memiliki minimal 1 komponen');

      const dapurId = menu.dapurId;
      if (dapurId) {
        const validKomponents = await this.prisma.komponenMaster.findMany({
          where: { id: { in: komponenIds }, dapurId },
        });
        if (validKomponents.length !== komponenIds.length) {
          throw new BadRequestException('Beberapa komponen tidak valid atau bukan milik dapur ini');
        }
      }

      // Delete old komponen, create new ones
      await this.prisma.menuKomponen.deleteMany({ where: { menuId: id } });

      const komponentList = await this.prisma.komponenMaster.findMany({
        where: { id: { in: komponenIds } },
        select: { id: true, nama: true },
      });

      await this.prisma.menuKomponen.createMany({
        data: komponentList.map((k) => ({
          menuId: id,
          komponenMasterId: k.id,
          namaSnapshot: k.nama,
        })),
      });
    }

    return this.prisma.menuMaster.update({
      where: { id },
      data: menuData,
      include: {
        komponen: { include: { komponenMaster: true } },
        dapur: { select: { nama: true } },
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const menu = await this.findOne(id);

    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (menu.dapurId !== dapurId) throw new ForbiddenException('Bukan menu dapur Anda');
    }

    // Check for distributions
    const distCount = await this.prisma.distribusi.count({ where: { menuId: id } });
    if (distCount > 0) {
      throw new BadRequestException(
        `Menu ini terhubung dengan ${distCount} distribusi. Hapus distribusi terkait terlebih dahulu.`,
      );
    }

    return this.prisma.menuMaster.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // JADWAL
  // ══════════════════════════════════════════════════════════════════════════

  async setJadwal(setJadwalDto: SetJadwalDto) {
    const tanggal = new Date(setJadwalDto.tanggal);
    tanggal.setUTCHours(0, 0, 0, 0);

    return this.prisma.menuHarian.upsert({
      where: { tanggal_menuId: { tanggal, menuId: setJadwalDto.menuId } },
      update: {},
      create: { tanggal, menuId: setJadwalDto.menuId },
    });
  }

  async getJadwal(userId: string, userRole: string, tanggalFilter?: string) {
    const where: any = {};
    if (tanggalFilter) {
      const d = new Date(tanggalFilter);
      d.setUTCHours(0, 0, 0, 0);
      where.tanggal = d;
    }
    if (userRole === 'TIM_DAPUR') {
      const dapurId = await this.getDapurId(userId);
      if (dapurId) where.menu = { dapurId };
    }
    return this.prisma.menuHarian.findMany({
      where,
      include: {
        menu: {
          include: {
            komponen: { include: { komponenMaster: true } },
            dapur: { select: { nama: true } },
          },
        },
      },
      orderBy: { tanggal: 'desc' },
    });
  }
}
