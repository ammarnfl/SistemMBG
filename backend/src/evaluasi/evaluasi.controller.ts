import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { EvaluasiService } from './evaluasi.service';
import { CreateEvaluasiDto } from './dto/create-evaluasi.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
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
  getMenuToday(@Request() req: any, @Query('date') dateStr: string) {
    // Gunakan date dari query atau ambil tanggal hari ini di timezone lokal server
    const today = dateStr || new Date().toLocaleDateString('sv-SE'); // Format: YYYY-MM-DD
    return this.evaluasiService.getMenuToday(req.user.id, today);
  }

  @Roles(Role.PENERIMA_MANFAAT)
  @Post()
  createEvaluasi(@Request() req: any, @Body() dto: CreateEvaluasiDto) {
    return this.evaluasiService.createEvaluasi(req.user.id, dto);
  }

  @Roles(Role.PENERIMA_MANFAAT)
  @Get('riwayat')
  getRiwayat(@Request() req: any) {
    return this.evaluasiService.getRiwayat(req.user.id);
  }
}
