import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSekolahDto, UpdateSekolahDto } from './dto/sekolah.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SekolahService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sekolah.findMany({ include: { dapur: true }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const data = await this.prisma.sekolah.findUnique({ where: { id }, include: { dapur: true } });
    if (!data) throw new NotFoundException('Sekolah not found');
    return data;
  }

  async create(data: CreateSekolahDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new BadRequestException('Email sudah digunakan');

    const existingSekolah = await this.prisma.sekolah.findUnique({ where: { nama: data.nama } });
    if (existingSekolah) throw new BadRequestException('Nama sekolah sudah digunakan');

    const hashedPassword = await bcrypt.hash('mbg12345', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.nama,
          password: hashedPassword,
          role: 'GURU'
        }
      });

      const sekolah = await tx.sekolah.create({
        data: {
          nama: data.nama,
          alamat: data.alamat,
          provinsi: data.provinsi,
          kabupatenKota: data.kabupatenKota,
          kecamatan: data.kecamatan,
          dapurId: data.dapurId,
        }
      });

      await tx.guruProfile.create({
        data: {
          userId: user.id,
          sekolahId: sekolah.id
        }
      });

      return sekolah;
    });
  }

  async createBatch(items: CreateSekolahDto[]) {
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

  async update(id: string, dto: UpdateSekolahDto) {
    await this.findOne(id);
    if (dto.nama) {
      const existing = await this.prisma.sekolah.findUnique({ where: { nama: dto.nama } });
      if (existing && existing.id !== id) throw new BadRequestException('Nama sekolah sudah digunakan');
    }
    // Only pick fields that exist on the Sekolah model.
    // (email is for creating the linked GURU user on create, not stored on Sekolah)
    const data: any = {};
    if (dto.nama    !== undefined) data.nama    = dto.nama;
    if (dto.alamat  !== undefined) data.alamat  = dto.alamat;
    if (dto.dapurId !== undefined) data.dapurId = dto.dapurId;
    if (dto.provinsi !== undefined) data.provinsi = dto.provinsi;
    if (dto.kabupatenKota !== undefined) data.kabupatenKota = dto.kabupatenKota;
    if (dto.kecamatan !== undefined) data.kecamatan = dto.kecamatan;
    return this.prisma.sekolah.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sekolah.delete({ where: { id } });
  }
}
