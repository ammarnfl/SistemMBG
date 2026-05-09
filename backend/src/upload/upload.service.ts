import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async handleUpload(file: Express.Multer.File) {
    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    
    // Multer diskStorage handles the saving, we just return the URL
    const filename = file.filename;
    const url = `${backendUrl}/uploads/${filename}`;

    return {
      filename,
      url,
    };
  }
}
