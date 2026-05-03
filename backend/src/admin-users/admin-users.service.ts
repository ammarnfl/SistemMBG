import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, MappingGuruDto, MappingPMDto } from './dto/admin-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({ 
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
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
    if (existing) throw new BadRequestException('Email already exists');
    
    let hashedPassword = await bcrypt.hash('mbg12345', 10);
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const { password, sekolahId, dapurId, ...saveData } = data;
    const user = await this.prisma.user.create({
      data: {
        ...saveData,
        password: hashedPassword,
      }
    });
    
    // Create profile with auto-mapping if provided
    if (user.role === 'GURU') {
      await this.prisma.guruProfile.create({ data: { userId: user.id, sekolahId: sekolahId || null } });
    } else if (user.role === 'PENERIMA_MANFAAT') {
      await this.prisma.penerimaManfaatProfile.create({ data: { userId: user.id, sekolahId: sekolahId || null } });
    } else if (user.role === 'TIM_DAPUR') {
      await this.prisma.timDapurProfile.create({ data: { userId: user.id, dapurId: dapurId || null } });
    }

    const { password: _, ...result } = user;
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
    if (data.password) {
       updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const updatedUser = await this.prisma.user.update({ where: { id }, data: updateData });
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
