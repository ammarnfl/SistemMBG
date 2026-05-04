import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [UploadController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class UploadModule {}
