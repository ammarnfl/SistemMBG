import { IsString, IsOptional, IsArray, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Ayam Rica' })
  @IsString()
  @IsNotEmpty({ message: 'Nama menu wajib diisi' })
  nama: string;

  @ApiPropertyOptional({ example: 'Nasi putih dengan lauk ayam pedas' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({ example: 'https://example.com/foto.jpg' })
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional({ description: 'Array of KomponenMaster IDs', example: ['id1', 'id2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  komponenIds?: string[];

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  energiKkal?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  proteinGram?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lemakGram?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  karbohidratGram?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  seratGram?: number;
}
