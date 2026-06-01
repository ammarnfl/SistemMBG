import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ObservasiController } from './observasi.controller';
import { ObservasiService } from './observasi.service';

@Module({
  imports: [PrismaModule],
  controllers: [ObservasiController],
  providers: [ObservasiService],
  exports: [ObservasiService],
})
export class ObservasiModule {}
