import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DapurService } from './dapur.service';
import { CreateDapurDto, UpdateDapurDto } from './dto/dapur.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Dapur')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('dapur')
export class DapurController {
  constructor(private readonly dapurService: DapurService) {}

  @Post()
  create(@Body() createDapurDto: CreateDapurDto) {
    return this.dapurService.create(createDapurDto);
  }

  @Post('batch')
  createBatch(@Body() data: { items: CreateDapurDto[] }) {
    return this.dapurService.createBatch(data.items);
  }

  @Get()
  findAll() {
    return this.dapurService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dapurService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDapurDto: UpdateDapurDto) {
    return this.dapurService.update(id, updateDapurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dapurService.remove(id);
  }
}
