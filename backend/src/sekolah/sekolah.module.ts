import { Module } from '@nestjs/common';
import { SekolahService } from './sekolah.service';
import { SekolahController } from './sekolah.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SekolahController],
  providers: [SekolahService],
})
export class SekolahModule {}
