import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKelasDto, UpdateKelasDto } from './dto/kelas.dto';

@Injectable()
export class KelasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kelas.findMany({ include: { sekolah: true }, orderBy: { createdAt: 'desc' } });
  }

  async findBySekolah(sekolahId: string) {
    return this.prisma.kelas.findMany({ where: { sekolahId }, orderBy: { nama: 'asc' } });
  }

  async findOne(id: string) {
    const data = await this.prisma.kelas.findUnique({ where: { id }, include: { sekolah: true } });
    if (!data) throw new NotFoundException('Kelas not found');
    return data;
  }

  async create(data: CreateKelasDto) {
    return this.prisma.kelas.create({ data });
  }

  async createBatch(items: CreateKelasDto[]) {
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
       throw new Error('Semua data gagal diproses');
    }
    
    return { message: 'Batch upload selesai', data: results };
  }

  async update(id: string, data: UpdateKelasDto) {
    await this.findOne(id);
    return this.prisma.kelas.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.kelas.delete({ where: { id } });
  }
}
