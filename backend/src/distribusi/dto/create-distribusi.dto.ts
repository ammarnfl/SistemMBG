import { IsString, IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusDistribusi } from '@prisma/client';

export class CreateDistribusiDto {
  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  tanggal: string;

  @ApiProperty()
  @IsString()
  sekolahId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dapurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  menuId?: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  jumlahPorsi: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  catatanDapur?: string;
  
  @ApiPropertyOptional({ enum: StatusDistribusi, default: StatusDistribusi.DRAFT })
  @IsOptional()
  @IsEnum(StatusDistribusi)
  status?: StatusDistribusi;
}
