import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusKonsumsi } from '@prisma/client';

export class PenilaianKomponenDto {
  @ApiProperty()
  @IsString()
  komponenId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  skorKeterhabisan: number;
}

export class CreateEvaluasiDto {
  @ApiProperty()
  @IsString()
  tanggal: string; // Format YYYY-MM-DD

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  distribusiId?: string;

  @ApiProperty({ enum: StatusKonsumsi })
  @IsEnum(StatusKonsumsi)
  statusKonsumsi: StatusKonsumsi;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingKeseluruhan?: number;

  @ApiPropertyOptional({ type: [PenilaianKomponenDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenilaianKomponenDto)
  penilaianKomponen?: PenilaianKomponenDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoUrl?: string;
}
