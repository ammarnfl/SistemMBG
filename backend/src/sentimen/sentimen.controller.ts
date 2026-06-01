import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SentimenService } from './sentimen.service';
import { PrismaService } from '../prisma/prisma.service';
import { categorize } from '../kategori/kategori.service';

@ApiTags('Sentimen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sentimen')
export class SentimenController {
  constructor(
    private readonly sentimenService: SentimenService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(Role.ADMIN)
  @Post('trigger')
  @ApiOperation({ summary: 'Admin: trigger analisis sentimen untuk semua feedback yang belum diproses' })
  async triggerAnalysis() {
    return this.sentimenService.triggerManual();
  }

  @Roles(Role.ADMIN)
  @Post('recategorize')
  @ApiOperation({ summary: 'Admin: backfill kategorisasi untuk feedback lama yang belum dikategorisasi' })
  async recategorize() {
    const pending = await this.prisma.evaluasiHarian.findMany({
      where: {
        feedback: { not: null },
        kategori: { isEmpty: true },
      },
      select: { id: true, feedback: true },
    });

    let processed = 0;
    for (const record of pending) {
      if (!record.feedback) continue;
      const kategori = categorize(record.feedback);
      await this.prisma.evaluasiHarian.update({
        where: { id: record.id },
        data: { kategori },
      });
      processed++;
    }

    return { processed, total: pending.length };
  }
}
