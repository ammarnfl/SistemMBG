import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async handleUpload(file: Express.Multer.File) {
    // Multer diskStorage sudah menyimpan file; kita kembalikan PATH RELATIF saja
    // (bukan URL ber-host). Host yang di-bake ke DB rapuh: tidak bisa dijangkau
    // dari browser remote saat lewat tunnel, dan quick tunnel berganti domain
    // tiap restart. Frontend meresolusi path ini lewat proxy same-origin.
    const filename = file.filename;
    const url = `/uploads/${filename}`;

    return {
      filename,
      url,
    };
  }
}
