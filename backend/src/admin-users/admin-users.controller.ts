import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateUserDto, UpdateUserDto, MappingGuruDto, MappingPMDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.adminUsersService.create(createUserDto);
  }

  @Post('batch')
  createBatch(@Body() data: { items: CreateUserDto[] }) {
    return this.adminUsersService.createBatch(data.items);
  }

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminUsersService.update(id, updateUserDto);
  }

  @Patch(':id/nonaktifkan')
  nonaktifkan(@Param('id') id: string) {
    return this.adminUsersService.nonaktifkan(id);
  }

  @Post(':id/mapping-guru')
  mappingGuru(@Param('id') id: string, @Body() mappingGuruDto: MappingGuruDto) {
    return this.adminUsersService.mappingGuru(id, mappingGuruDto);
  }

  @Post(':id/mapping-pm')
  mappingPM(@Param('id') id: string, @Body() mappingPMDto: MappingPMDto) {
    return this.adminUsersService.mappingPM(id, mappingPMDto);
  }

  @Post('fix-dapur-mapping')
  async fixDapurMapping() {
    const prisma = this.adminUsersService['prisma'];
    const users = await prisma.user.findMany({ where: { role: 'TIM_DAPUR' } });
    let count = 0;
    for (const user of users) {
      const profile = await prisma.timDapurProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        const dapur = await prisma.dapur.create({
          data: { nama: `Dapur ${user.name}`, alamat: 'Alamat default' }
        });
        await prisma.timDapurProfile.create({
          data: { userId: user.id, dapurId: dapur.id }
        });
        count++;
      }
    }
    return { success: true, fixed: count };
  }
}
