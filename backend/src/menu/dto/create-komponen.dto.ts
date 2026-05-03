import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKomponenDto {
  @ApiProperty({ example: 'Ayam Rica' })
  @IsString()
  nama: string;

  @ApiPropertyOptional({ example: '100 gr' })
  @IsOptional()
  @IsString()
  porsi?: string;

  @ApiPropertyOptional({ example: 'Potongan dadu pedas' })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
