import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, MappingGuruDto, MappingPMDto } from './dto/admin-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ 
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        isActive: true, 
        createdAt: true,
        guruProfile: { include: { sekolah: true } },
        penerimaManfaatProfile: { include: { sekolah: true, kelas: true } },
        timDapurProfile: { include: { dapur: true } }
      },
      orderBy: { createdAt: 'desc' } 
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      include: { guruProfile: true, penerimaManfaatProfile: true }
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email sudah digunakan');
    
    let hashedPassword = await bcrypt.hash('mbg12345', 10);
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const { password: _, sekolahId, dapurId, nisn, kelasId, ...saveData } = data;
    
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...saveData,
          password: hashedPassword,
        }
      });
      
      // Create profile with mandatory mapping if role requires it
      if (user.role === 'GURU') {
        if (!sekolahId) throw new BadRequestException('Sekolah harus dipilih untuk user dengan role GURU');
        await tx.guruProfile.create({ data: { userId: user.id, sekolahId } });
      } else if (user.role === 'PENERIMA_MANFAAT') {
        if (!sekolahId) throw new BadRequestException('Sekolah harus dipilih untuk user dengan role PENERIMA_MANFAAT');
        if (!kelasId) throw new BadRequestException('Kelas harus dipilih untuk user dengan role PENERIMA_MANFAAT');
        await tx.penerimaManfaatProfile.create({ data: { userId: user.id, sekolahId, kelasId, nisn } });
      } else if (user.role === 'TIM_DAPUR') {
        if (!dapurId) throw new BadRequestException('Dapur harus dipilih untuk user dengan role TIM_DAPUR');
        await tx.timDapurProfile.create({ data: { userId: user.id, dapurId } });
      }

      const { password: __, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return result;
  }

  async createBatch(items: CreateUserDto[]) {
    const results = { success: 0, failed: 0, errors: [] as any[] };
    for (let i = 0; i < items.length; i++) {
      try {
        await this.create(items[i]);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ 
          row: i + 1, 
          email: items[i].email || 'Unknown', 
          message: error.message || 'Unknown error' 
        });
      }
    }
    
    if (results.failed > 0 && results.success === 0) {
       throw new BadRequestException({ message: 'Semua data gagal diproses', details: results });
    }
    
    return { message: 'Batch upload selesai', data: results };
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);
    
    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new BadRequestException('Email already exists');
    }

    const updateData: any = { ...data };
    delete updateData.nisn;
    delete updateData.kelasId;

    if (data.password) {
       updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const updatedUser = await this.prisma.user.update({ where: { id }, data: updateData });

    if (user.role === 'PENERIMA_MANFAAT' && (data.nisn !== undefined || data.kelasId !== undefined)) {
      const pmData: any = {};
      if (data.nisn !== undefined) pmData.nisn = data.nisn;
      if (data.kelasId !== undefined) pmData.kelasId = data.kelasId;
      await this.prisma.penerimaManfaatProfile.update({
        where: { userId: id },
        data: pmData
      });
    }
    const { password: _, ...result } = updatedUser;
    return result;
  }

  async nonaktifkan(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false }, select: { id: true, isActive: true } });
  }

  async mappingGuru(id: string, data: MappingGuruDto) {
    const user = await this.findOne(id);
    if (user.role !== 'GURU') throw new BadRequestException('User is not a GURU');
    
    const sekolah = await this.prisma.sekolah.findUnique({ where: { id: data.sekolahId } });
    if (!sekolah) throw new NotFoundException('Sekolah not found');

    return this.prisma.guruProfile.upsert({
      where: { userId: id },
      create: { userId: id, sekolahId: data.sekolahId },
      update: { sekolahId: data.sekolahId }
    });
  }

  async mappingPM(id: string, data: MappingPMDto) {
    const user = await this.findOne(id);
    if (user.role !== 'PENERIMA_MANFAAT') throw new BadRequestException('User is not a PENERIMA_MANFAAT');

    const sekolah = await this.prisma.sekolah.findUnique({ where: { id: data.sekolahId } });
    if (!sekolah) throw new NotFoundException('Sekolah not found');

    const kelas = await this.prisma.kelas.findUnique({ where: { id: data.kelasId } });
    if (!kelas || kelas.sekolahId !== data.sekolahId) throw new NotFoundException('Kelas invalid or not in this sekolah');

    return this.prisma.penerimaManfaatProfile.upsert({
      where: { userId: id },
      create: { userId: id, sekolahId: data.sekolahId, kelasId: data.kelasId },
      update: { sekolahId: data.sekolahId, kelasId: data.kelasId }
    });
  }
}
