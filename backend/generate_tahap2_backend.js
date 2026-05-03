const fs = require('fs');
const path = require('path');

const writeCode = (filepath, content) => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, content.trim() + '\n', 'utf8');
};

// ================= DAPUR =================
writeCode('./src/dapur/dto/dapur.dto.ts', `
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDapurDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alamat?: string;
}

export class UpdateDapurDto extends CreateDapurDto {}
`);

writeCode('./src/dapur/dapur.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDapurDto, UpdateDapurDto } from './dto/dapur.dto';

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
    return this.prisma.dapur.create({ data });
  }

  async update(id: string, data: UpdateDapurDto) {
    await this.findOne(id);
    return this.prisma.dapur.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dapur.delete({ where: { id } });
  }
}
`);

writeCode('./src/dapur/dapur.controller.ts', `
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DapurService } from './dapur.service';
import { CreateDapurDto, UpdateDapurDto } from './dto/dapur.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Dapur')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('dapur')
export class DapurController {
  constructor(private readonly dapurService: DapurService) {}

  @Post()
  create(@Body() createDapurDto: CreateDapurDto) {
    return this.dapurService.create(createDapurDto);
  }

  @Get()
  findAll() {
    return this.dapurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dapurService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDapurDto: UpdateDapurDto) {
    return this.dapurService.update(id, updateDapurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dapurService.remove(id);
  }
}
`);

writeCode('./src/dapur/dapur.module.ts', `
import { Module } from '@nestjs/common';
import { DapurService } from './dapur.service';
import { DapurController } from './dapur.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DapurController],
  providers: [DapurService],
})
export class DapurModule {}
`);


// ================= SEKOLAH =================
writeCode('./src/sekolah/dto/sekolah.dto.ts', `
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSekolahDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dapurId?: string;
}

export class UpdateSekolahDto extends CreateSekolahDto {}
`);

writeCode('./src/sekolah/sekolah.service.ts', `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSekolahDto, UpdateSekolahDto } from './dto/sekolah.dto';

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
    return this.prisma.sekolah.create({ data });
  }

  async update(id: string, data: UpdateSekolahDto) {
    await this.findOne(id);
    return this.prisma.sekolah.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sekolah.delete({ where: { id } });
  }
}
`);

writeCode('./src/sekolah/sekolah.controller.ts', `
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SekolahService } from './sekolah.service';
import { CreateSekolahDto, UpdateSekolahDto } from './dto/sekolah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Sekolah')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.ADMIN) // Let's keep it restricted or viewable by others
@Controller('sekolah')
export class SekolahController {
  constructor(private readonly sekolahService: SekolahService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createSekolahDto: CreateSekolahDto) {
    return this.sekolahService.create(createSekolahDto);
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get()
  findAll() {
    return this.sekolahService.findAll();
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sekolahService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSekolahDto: UpdateSekolahDto) {
    return this.sekolahService.update(id, updateSekolahDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sekolahService.remove(id);
  }
}
`);

writeCode('./src/sekolah/sekolah.module.ts', `
import { Module } from '@nestjs/common';
import { SekolahService } from './sekolah.service';
import { SekolahController } from './sekolah.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SekolahController],
  providers: [SekolahService],
})
export class SekolahModule {}
`);


// ================= KELAS =================
writeCode('./src/kelas/dto/kelas.dto.ts', `
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKelasDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;
}

export class UpdateKelasDto extends CreateKelasDto {}
`);

writeCode('./src/kelas/kelas.service.ts', `
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

  async update(id: string, data: UpdateKelasDto) {
    await this.findOne(id);
    return this.prisma.kelas.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.kelas.delete({ where: { id } });
  }
}
`);

writeCode('./src/kelas/kelas.controller.ts', `
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { KelasService } from './kelas.service';
import { CreateKelasDto, UpdateKelasDto } from './dto/kelas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Kelas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kelas')
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createKelasDto: CreateKelasDto) {
    return this.kelasService.create(createKelasDto);
  }

  @Roles(Role.ADMIN, Role.GURU)
  @ApiQuery({ name: 'sekolahId', required: false })
  @Get()
  findAll(@Query('sekolahId') sekolahId?: string) {
    if (sekolahId) {
      return this.kelasService.findBySekolah(sekolahId);
    }
    return this.kelasService.findAll();
  }

  @Roles(Role.ADMIN, Role.GURU)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kelasService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKelasDto: UpdateKelasDto) {
    return this.kelasService.update(id, updateKelasDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kelasService.remove(id);
  }
}
`);

writeCode('./src/kelas/kelas.module.ts', `
import { Module } from '@nestjs/common';
import { KelasService } from './kelas.service';
import { KelasController } from './kelas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KelasController],
  providers: [KelasService],
})
export class KelasModule {}
`);


// ================= ADMIN USERS =================
writeCode('./src/admin-users/dto/admin-user.dto.ts', `
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}

export class MappingGuruDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;
}

export class MappingPMDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  kelasId: string;
}
`);

writeCode('./src/admin-users/admin-users.service.ts', `
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
    
    let hashedPassword = await bcrypt.hash('password123', 10);
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    const { password, ...saveData } = data;
    const user = await this.prisma.user.create({
      data: {
        ...saveData,
        password: hashedPassword,
      }
    });
    
    // Create empty profile if needed
    if (user.role === 'GURU') {
      await this.prisma.guruProfile.create({ data: { userId: user.id } });
    } else if (user.role === 'PENERIMA_MANFAAT') {
      await this.prisma.penerimaManfaatProfile.create({ data: { userId: user.id } });
    }

    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);
    const updateData: any = { ...data };
    if (data.password) {
       updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data: updateData });
    const { password: _, ...result } = user;
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
`);

writeCode('./src/admin-users/admin-users.controller.ts', `
import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateUserDto, UpdateUserDto, MappingGuruDto, MappingPMDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.adminUsersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminUsersService.update(id, updateUserDto);
  }

  @Patch(':id/nonaktifkan')
  nonaktifkan(@Param('id') id: string) {
    return this.adminUsersService.nonaktifkan(id);
  }

  @Post(':id/mapping-guru')
  mappingGuru(@Param('id') id: string, @Body() mappingGuruDto: MappingGuruDto) {
    return this.adminUsersService.mappingGuru(id, mappingGuruDto);
  }

  @Post(':id/mapping-pm')
  mappingPM(@Param('id') id: string, @Body() mappingPMDto: MappingPMDto) {
    return this.adminUsersService.mappingPM(id, mappingPMDto);
  }
}
`);

writeCode('./src/admin-users/admin-users.module.ts', `
import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
`);

console.log("Backend Stage 2 files generated successfully.");
