import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKomponenMasterDto {
  @ApiProperty({ example: 'Nasi Putih' })
  @IsString()
  @IsNotEmpty({ message: 'Nama komponen wajib diisi' })
  nama: string;

  @ApiPropertyOptional({ example: 'Nasi putih pulen kualitas premium' })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
