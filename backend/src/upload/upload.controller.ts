import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SupabaseService } from './supabase.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('File not uploaded');
    }
    
    const result = await this.supabaseService.uploadFile(file);
    
    return {
      message: 'File uploaded successfully to Supabase',
      url: result.url,
      filename: result.filename,
    };
  }
}
