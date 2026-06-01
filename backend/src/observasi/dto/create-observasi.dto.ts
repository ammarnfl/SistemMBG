import { IsString, IsNotEmpty, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateObservasiDto {
  @ApiPropertyOptional({
    description:
      'ID distribusi terkait (opsional). Jika diisi, tanggal & sekolah diturunkan dari distribusi.',
  })
  @IsOptional()
  @IsString()
  distribusiId?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description: 'Tanggal observasi (wajib jika distribusiId tidak diisi).',
  })
  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @ApiProperty({ example: 'Makanan datang agak telat dan nasinya kurang.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  isi: string;
}
