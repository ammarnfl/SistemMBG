import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Request,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateKomponenMasterDto } from './dto/create-komponen-master.dto';
import { UpdateKomponenMasterDto } from './dto/update-komponen-master.dto';
import { SetJadwalDto } from './dto/set-jadwal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ── Komponen Master ───────────────────────────────────────────────────────

  @Roles('TIM_DAPUR', 'ADMIN')
  @Get('komponen-master')
  @ApiOperation({ summary: 'List komponen master milik dapur ini' })
  findAllKomponenMaster(@Request() req: any) {
    return this.menuService.findAllKomponenMaster(req.user.id, req.user.role);
  }

  @Roles('TIM_DAPUR')
  @Post('komponen-master')
  @ApiOperation({ summary: 'Buat komponen master baru' })
  createKomponenMaster(@Request() req: any, @Body() dto: CreateKomponenMasterDto) {
    return this.menuService.createKomponenMaster(req.user.id, dto);
  }

  @Roles('TIM_DAPUR')
  @Put('komponen-master/:id')
  @ApiOperation({ summary: 'Update komponen master' })
  updateKomponenMaster(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateKomponenMasterDto,
  ) {
    return this.menuService.updateKomponenMaster(id, req.user.id, dto);
  }

  @Roles('TIM_DAPUR')
  @Delete('komponen-master/:id')
  @ApiOperation({ summary: 'Hapus komponen master' })
  deleteKomponenMaster(@Param('id') id: string, @Request() req: any) {
    return this.menuService.deleteKomponenMaster(id, req.user.id);
  }

  // ── Menu Master ───────────────────────────────────────────────────────────

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create menu master' })
  create(@Request() req: any, @Body() dto: CreateMenuDto) {
    return this.menuService.create(req.user.id, dto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List all menu master (scoped by role)' })
  findAll(@Request() req: any) {
    return this.menuService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu detail' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, req.user.id, dto, req.user.role);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Hapus menu' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.menuService.remove(id, req.user.id, req.user.role);
  }

  // ── Jadwal ────────────────────────────────────────────────────────────────

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post('jadwal')
  @ApiOperation({ summary: 'Set menu active for a specific date' })
  setJadwal(@Body() setJadwalDto: SetJadwalDto) {
    return this.menuService.setJadwal(setJadwalDto);
  }

  @Get('jadwal/list')
  @ApiOperation({ summary: 'Get scheduled menu harian filter by date' })
  getJadwal(@Request() req: any, @Query('tanggal') tanggal?: string) {
    return this.menuService.getJadwal(req.user.id, req.user.role, tanggal);
  }
}
