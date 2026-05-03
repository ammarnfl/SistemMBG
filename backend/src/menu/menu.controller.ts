import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreateKomponenDto } from './dto/create-komponen.dto';
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

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create menu master' })
  create(@Request() req: any, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(req.user.id, createMenuDto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List all menu master' })
  findAll(@Request() req: any) {
    return this.menuService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu detail' })
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Post(':id/komponen')
  @ApiOperation({ summary: 'Add components to menu' })
  createKomponen(@Param('id') id: string, @Body() createKomponenDto: CreateKomponenDto) {
    return this.menuService.createKomponen(id, createKomponenDto);
  }

  @Roles('TIM_DAPUR', 'ADMIN')
  @Delete('komponen/:id')
  @ApiOperation({ summary: 'Remove a component' })
  removeKomponen(@Param('id') id: string) {
    return this.menuService.removeKomponen(id);
  }

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
