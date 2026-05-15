import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { KelasService } from './kelas.service';
import { CreateKelasDto, UpdateKelasDto } from './dto/kelas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
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

  @Roles(Role.ADMIN)
  @Post('batch')
  createBatch(@Body() data: import('./dto/kelas.dto').BulkCreateKelasDto) {
    return this.kelasService.createBatch(data.kelas);
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
