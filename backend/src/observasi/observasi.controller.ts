import {
  Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ObservasiService } from './observasi.service';
import { CreateObservasiDto } from './dto/create-observasi.dto';

@ApiTags('Observasi Guru')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('observasi')
export class ObservasiController {
  constructor(private readonly observasiService: ObservasiService) {}

  @Roles(Role.GURU)
  @Post()
  @ApiOperation({ summary: 'Guru: kirim observasi/komentar tentang makanan harian' })
  create(@Request() req: any, @Body() dto: CreateObservasiDto) {
    return this.observasiService.create(req.user.id, dto);
  }

  @Roles(Role.GURU, Role.TIM_DAPUR, Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List observasi guru (di-scope per peran)' })
  @ApiQuery({ name: 'distribusiId', required: false })
  @ApiQuery({ name: 'tanggal', required: false })
  @ApiQuery({ name: 'sekolahId', required: false })
  list(
    @Request() req: any,
    @Query('distribusiId') distribusiId?: string,
    @Query('tanggal') tanggal?: string,
    @Query('sekolahId') sekolahId?: string,
  ) {
    return this.observasiService.list(req.user.id, req.user.role, {
      distribusiId,
      tanggal,
      sekolahId,
    });
  }

  @Roles(Role.GURU)
  @Delete(':id')
  @ApiOperation({ summary: 'Guru: hapus observasi milik sendiri' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.observasiService.remove(req.user.id, id);
  }
}
