import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SekolahService } from './sekolah.service';
import { CreateSekolahDto, UpdateSekolahDto } from './dto/sekolah.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Sekolah')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.ADMIN) // Let's keep it restricted or viewable by others
@Controller('sekolah')
export class SekolahController {
  constructor(private readonly sekolahService: SekolahService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createSekolahDto: CreateSekolahDto) {
    return this.sekolahService.create(createSekolahDto);
  }

  @Roles(Role.ADMIN)
  @Post('batch')
  createBatch(@Body() data: { items: CreateSekolahDto[] }) {
    return this.sekolahService.createBatch(data.items);
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get()
  findAll() {
    return this.sekolahService.findAll();
  }

  @Roles(Role.ADMIN, Role.TIM_DAPUR, Role.GURU)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sekolahService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSekolahDto: UpdateSekolahDto) {
    return this.sekolahService.update(id, updateSekolahDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sekolahService.remove(id);
  }
}
