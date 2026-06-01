import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query, Request } from '@nestjs/common';
import { DistribusiService } from './distribusi.service';
import { CreateDistribusiDto } from './dto/create-distribusi.dto';
import { UpdateStatusDto, KonfirmasiDistribusiDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('distribusi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('distribusi')
export class DistribusiController {
  constructor(private readonly distribusiService: DistribusiService) {}

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create single distribusi record' })
  create(@Request() req: any, @Body() dto: CreateDistribusiDto) {
    return this.distribusiService.create(req.user.id, dto);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post('batch')
  @ApiOperation({ summary: 'Create multiple distribusi records from batch' })
  createBatch(@Request() req: any, @Body() payload: { items: CreateDistribusiDto[] }) {
    return this.distribusiService.createBatch(req.user.id, payload.items);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Get()
  @ApiOperation({ summary: 'List distribusi for Dapur/Admin' })
  findAll(@Request() req: any, @Query('dapurId') dapurId?: string, @Query('tanggal') tanggal?: string) {
    return this.distribusiService.findAll(req.user.id, { dapurId, tanggal }, req.user.role);
  }

  @Roles('GURU')
  @Get('sekolah-saya')
  @ApiOperation({ summary: 'List distribusi for logged-in Guru' })
  findByGuru(@Request() req: any, @Query('tanggal') tanggal?: string) {
    return this.distribusiService.findByGuru(req.user.id, tanggal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail distribusi' })
  findOne(@Param('id') id: string) {
    return this.distribusiService.findOne(id);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status (e.g. DIKIRIM) by Dapur' })
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.distribusiService.updateStatusDapur(id, req.user.id, req.user.role, dto);
  }

  @Roles('GURU')
  @Patch(':id/konfirmasi')
  @ApiOperation({ summary: 'Confirm receipt of distribution by Guru' })
  konfirmasi(@Request() req: any, @Param('id') id: string, @Body() dto: KonfirmasiDistribusiDto) {
    return this.distribusiService.konfirmasiGuru(id, req.user.id, dto);
  }
}
