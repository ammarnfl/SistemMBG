import { Module } from '@nestjs/common';
import { KategoriService } from './kategori.service';

@Module({
  providers: [KategoriService],
  exports: [KategoriService],
})
export class KategoriModule {}
