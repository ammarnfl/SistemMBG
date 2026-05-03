import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { EvaluasiService } from './evaluasi.service';
import { CreateEvaluasiDto } from './dto/create-evaluasi.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Evaluasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluasi')
export class EvaluasiController {
  constructor(private readonly evaluasiService: EvaluasiService) {}

  @Roles(Role.PENERIMA_MANFAAT)
  @Get('today')
  getMenuToday(@Request() req, @Query('date') dateStr: string) {
    const today = dateStr || new Date().toISOString().split('T')[0];
    return this.evaluasiService.getMenuToday(req.user.id, today);
  }

  @Roles(Role.PENERIMA_MANFAAT)
  @Post()
  createEvaluasi(@Request() req, @Body() dto: CreateEvaluasiDto) {
    return this.evaluasiService.createEvaluasi(req.user.id, dto);
  }

  @Roles(Role.PENERIMA_MANFAAT)
  @Get('riwayat')
  getRiwayat(@Request() req) {
    return this.evaluasiService.getRiwayat(req.user.id);
  }
}
