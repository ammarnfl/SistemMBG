import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SentimenService } from './sentimen.service';

@ApiTags('Sentimen')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sentimen')
export class SentimenController {
  constructor(private readonly sentimenService: SentimenService) {}

  @Roles(Role.ADMIN)
  @Post('trigger')
  @ApiOperation({ summary: 'Admin: trigger analisis sentimen untuk semua feedback yang belum diproses' })
  async triggerAnalysis() {
    return this.sentimenService.triggerManual();
  }
}
