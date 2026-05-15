import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDapurDto, UpdateDapurDto } from './dto/dapur.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DapurService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dapur.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const data = await this.prisma.dapur.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Dapur not found');
    return data;
  }

  async create(data: CreateDapurDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new BadRequestException('Email sudah digunakan');

    const existingDapur = await this.prisma.dapur.findUnique({ where: { nama: data.nama } });
    if (existingDapur) throw new BadRequestException('Nama dapur sudah digunakan');

    const hashedPassword = await bcrypt.hash('mbg12345', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.nama,
          password: hashedPassword,
          role: 'TIM_DAPUR'
        }
      });

      const dapur = await tx.dapur.create({
        data: {
          nama: data.nama,
          alamat: data.alamat,
          kontak: data.kontak,
          provinsi: data.provinsi,
          kabupatenKota: data.kabupatenKota,
          kecamatan: data.kecamatan,
        }
      });

      await tx.timDapurProfile.create({
        data: {
          userId: user.id,
          dapurId: dapur.id
        }
      });

      return dapur;
    });
  }

  async createBatch(items: CreateDapurDto[]) {
    const results = { success: 0, failed: 0, errors: [] as any[] };
    for (let i = 0; i < items.length; i++) {
      try {
        await this.create(items[i]);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ 
          row: i + 1, 
          nama: items[i].nama || 'Unknown', 
          message: error.message || 'Unknown error' 
        });
      }
    }
    
    if (results.failed > 0 && results.success === 0) {
       throw new BadRequestException({ message: 'Semua data gagal diproses', details: results });
    }
    
    return { message: 'Batch upload selesai', data: results };
  }

  async update(id: string, data: UpdateDapurDto) {
    await this.findOne(id);
    if (data.nama) {
      const existing = await this.prisma.dapur.findUnique({ where: { nama: data.nama } });
      if (existing && existing.id !== id) throw new BadRequestException('Nama dapur sudah digunakan');
    }
    return this.prisma.dapur.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dapur.delete({ where: { id } });
  }
}
