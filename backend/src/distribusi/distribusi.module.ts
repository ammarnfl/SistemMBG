import { Module } from '@nestjs/common';
import { DistribusiService } from './distribusi.service';
import { DistribusiController } from './distribusi.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DistribusiController],
  providers: [DistribusiService, PrismaService],
})
export class DistribusiModule {}
