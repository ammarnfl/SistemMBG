import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateKomponenDto } from './dto/create-komponen.dto';
import { SetJadwalDto } from './dto/set-jadwal.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMenuDto: CreateMenuDto, userRole: string) {
    let dapurId = null;
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      dapurId = profile?.dapurId ?? null;
    }
    const data: any = { ...createMenuDto };
    if (dapurId) data.dapurId = dapurId;

    return this.prisma.menuMaster.create({ data });
  }

  async findAll(userId: string, userRole: string) {
    const where: any = {};
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) where.dapurId = profile.dapurId;
    }
    return this.prisma.menuMaster.findMany({
      where,
      include: { komponen: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menuMaster.findUnique({
      where: { id },
      include: { komponen: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async createKomponen(menuId: string, createKomponenDto: CreateKomponenDto) {
    await this.findOne(menuId);
    return this.prisma.menuKomponen.create({
      data: {
        ...createKomponenDto,
        menuId,
      },
    });
  }

  async removeKomponen(id: string) {
    return this.prisma.menuKomponen.delete({
      where: { id },
    });
  }

  async setJadwal(setJadwalDto: SetJadwalDto) {
    const tanggal = new Date(setJadwalDto.tanggal);
    tanggal.setHours(0, 0, 0, 0);

    return this.prisma.menuHarian.upsert({
      where: {
        tanggal_menuId: {
          tanggal,
          menuId: setJadwalDto.menuId,
        },
      },
      update: {}, // if it exists, do nothing or update 
      create: {
        tanggal,
        menuId: setJadwalDto.menuId,
      },
    });
  }

  async getJadwal(userId: string, userRole: string, tanggalFilter?: string) {
    const where: any = {};
    if (tanggalFilter) {
      const d = new Date(tanggalFilter);
      d.setHours(0,0,0,0);
      where.tanggal = d;
    }
    if (userRole === 'TIM_DAPUR') {
      const profile = await this.prisma.timDapurProfile.findUnique({ where: { userId } });
      if (profile?.dapurId) {
        where.menu = { dapurId: profile.dapurId };
      }
    }
    return this.prisma.menuHarian.findMany({
      where,
      include: {
        menu: {
          include: { komponen: true }
        }
      },
      orderBy: { tanggal: 'desc' },
    });
  }
}
