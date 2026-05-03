import { Module } from '@nestjs/common';
import { EvaluasiController } from './evaluasi.controller';
import { EvaluasiService } from './evaluasi.service';

@Module({
  controllers: [EvaluasiController],
  providers: [EvaluasiService]
})
export class EvaluasiModule {}
