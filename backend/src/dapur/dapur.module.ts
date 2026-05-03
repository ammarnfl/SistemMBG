import { Module } from '@nestjs/common';
import { DapurService } from './dapur.service';
import { DapurController } from './dapur.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DapurController],
  providers: [DapurService],
})
export class DapurModule {}
