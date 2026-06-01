import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SentimenLabel } from '@prisma/client';
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Roles(Role.TIM_DAPUR, Role.GURU)
  @Get()
  @ApiOperation({ summary: 'Tim Dapur: paginated feedback list with filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tanggalAwal', required: false })
  @ApiQuery({ name: 'tanggalAkhir', required: false })
  @ApiQuery({ name: 'sentimen', required: false, enum: SentimenLabel })
  @ApiQuery({ name: 'sekolahId', required: false })
  @ApiQuery({ name: 'resolved', required: false })
  @ApiQuery({ name: 'kategori', required: false })
  listFeedback(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('search') search?: string,
    @Query('tanggalAwal') tanggalAwal?: string,
    @Query('tanggalAkhir') tanggalAkhir?: string,
    @Query('sentimen') sentimen?: SentimenLabel,
    @Query('sekolahId') sekolahId?: string,
    @Query('resolved') resolved?: string,
    @Query('kategori') kategori?: string,
  ) {
    return this.feedbackService.listFeedback(req.user.id, {
      page: page ? parseInt(page) : 1,
      search,
      tanggalAwal,
      tanggalAkhir,
      sentimen,
      sekolahId,
      resolved,
      kategori,
    });
  }

  @Roles(Role.TIM_DAPUR, Role.GURU)
  @Get('sekolah')
  @ApiOperation({ summary: 'Tim Dapur: get sekolah list for filter dropdown' })
  getSekolahList(@Request() req: any) {
    return this.feedbackService.getSekolahList(req.user.id);
  }

  @Roles(Role.TIM_DAPUR)
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Tim Dapur: mark feedback as resolved' })
  resolveFeedback(
    @Request() req: any,
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ) {
    return this.feedbackService.resolveFeedback(req.user.id, id, resolution);
  }

  @Roles(Role.TIM_DAPUR, Role.ADMIN)
  @Get('last-refresh')
  @ApiOperation({ summary: 'Get last sentiment analysis refresh time' })
  getLastRefresh() {
    return this.feedbackService.getLastSentimenRefresh();
  }
}
