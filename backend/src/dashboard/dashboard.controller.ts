import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @Get('admin')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Roles(Role.TIM_DAPUR)
  @Get('dapur')
  @ApiOperation({ summary: 'Tim Dapur dashboard stats' })
  getDapurStats(
    @Request() req: any,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
  ) {
    return this.dashboardService.getDapurStats(req.user.id, tanggalAwal, tanggalAkhir);
  }

  @Roles(Role.GURU)
  @Get('guru')
  @ApiOperation({ summary: 'Guru dashboard stats' })
  getGuruStats(@Request() req: any) {
    return this.dashboardService.getGuruStats(req.user.id);
  }

  @Roles(Role.GURU)
  @Get('guru/monitoring')
  @ApiOperation({ summary: 'Guru monitoring: list PM sudah/belum isi hari ini' })
  getGuruMonitoring(@Request() req: any) {
    return this.dashboardService.getGuruMonitoring(req.user.id);
  }

  @Roles(Role.PENERIMA_MANFAAT)
  @Get('pm')
  @ApiOperation({ summary: 'Penerima Manfaat dashboard stats' })
  getPMStats(@Request() req: any) {
    return this.dashboardService.getPMStats(req.user.id);
  }
}
