import { Controller, Get, UseGuards, Request, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { LaporanService } from './laporan.service';
import type { Response } from 'express';

@ApiTags('Laporan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  // ── JSON data endpoints (for table UI) ────────────────────────────────────

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('distribusi/data')
  @ApiOperation({ summary: 'Laporan distribusi JSON (paginated)' })
  distribusiData(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
    @Query('sekolahId') sekolahId?: string,
    @Query('status') status?: string,
  ) {
    return this.laporanService.distribusiData(req.user.id, req.user.role, {
      page: page ? parseInt(page) : 1,
      search,
      tanggalAwal,
      tanggalAkhir,
      sekolahId,
      status,
    });
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('evaluasi/data')
  @ApiOperation({ summary: 'Laporan evaluasi JSON (paginated)' })
  evaluasiData(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
    @Query('sekolahId') sekolahId?: string,
  ) {
    return this.laporanService.evaluasiData(req.user.id, req.user.role, {
      page: page ? parseInt(page) : 1,
      search,
      tanggalAwal,
      tanggalAkhir,
      sekolahId,
    });
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('komponen/data')
  @ApiOperation({ summary: 'Laporan keterhabisan komponen JSON (paginated)' })
  komponenData(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
    @Query('sekolahId') sekolahId?: string,
  ) {
    return this.laporanService.komponenData(req.user.id, req.user.role, {
      page: page ? parseInt(page) : 1,
      search,
      tanggalAwal,
      tanggalAkhir,
      sekolahId,
    });
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('feedback/data')
  @ApiOperation({ summary: 'Laporan feedback JSON (paginated)' })
  feedbackData(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
    @Query('sekolahId') sekolahId?: string,
  ) {
    return this.laporanService.feedbackData(req.user.id, req.user.role, {
      page: page ? parseInt(page) : 1,
      search,
      tanggalAwal,
      tanggalAkhir,
      sekolahId,
    });
  }

  // ── CSV export endpoints ─────────────────────────────────────────────────

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('distribusi')
  @ApiOperation({ summary: 'Export laporan distribusi CSV' })
  @ApiQuery({ name: 'tanggalAwal', required: false })
  @ApiQuery({ name: 'tanggalAkhir', required: false })
  async distribusi(
    @Request() req: any,
    @Res() res: Response,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    const csv = await this.laporanService.laporanDistribusi(req.user.id, req.user.role, tanggalAwal, tanggalAkhir);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-distribusi.csv"');
    res.send('\uFEFF' + csv);
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('evaluasi')
  @ApiOperation({ summary: 'Export laporan evaluasi konsumsi CSV' })
  @ApiQuery({ name: 'tanggalAwal', required: false })
  @ApiQuery({ name: 'tanggalAkhir', required: false })
  async evaluasi(
    @Request() req: any,
    @Res() res: Response,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    const csv = await this.laporanService.laporanEvaluasi(req.user.id, req.user.role, tanggalAwal, tanggalAkhir);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-evaluasi.csv"');
    res.send('\uFEFF' + csv);
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('komponen')
  @ApiOperation({ summary: 'Export laporan keterhabisan komponen CSV' })
  @ApiQuery({ name: 'tanggalAwal', required: false })
  @ApiQuery({ name: 'tanggalAkhir', required: false })
  async komponen(
    @Request() req: any,
    @Res() res: Response,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    const csv = await this.laporanService.laporanKomponen(req.user.id, req.user.role, tanggalAwal, tanggalAkhir);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-komponen.csv"');
    res.send('\uFEFF' + csv);
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get('feedback')
  @ApiOperation({ summary: 'Export laporan feedback CSV' })
  @ApiQuery({ name: 'tanggalAwal', required: false })
  @ApiQuery({ name: 'tanggalAkhir', required: false })
  async feedback(
    @Request() req: any,
    @Res() res: Response,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    const csv = await this.laporanService.laporanFeedback(req.user.id, req.user.role, tanggalAwal, tanggalAkhir);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-feedback.csv"');
    res.send('\uFEFF' + csv);
  }
}
