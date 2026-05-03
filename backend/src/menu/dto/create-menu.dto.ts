import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Ayam Rica' })
  @IsString()
  nama: string;

  @ApiPropertyOptional({ example: 'Nasi putih dengan lauk ayam pedas' })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
