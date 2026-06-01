import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login dan dapatkan JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, mengembalikan accessToken dan data user.',
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah.' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dapatkan data user yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data user berhasil diambil.' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi.' })
  async getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id as string);
  }

  @Get('fix-dapur')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] One-off fix: pasangkan TimDapurProfile untuk user TIM_DAPUR yang belum dipetakan' })
  async fixDapur() {
    const prisma = this.authService['prisma'];
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
    return { fixed: count };
  }
}
