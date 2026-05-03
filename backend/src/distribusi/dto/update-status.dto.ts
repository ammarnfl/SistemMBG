import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusDistribusi } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusDistribusi })
  @IsEnum(StatusDistribusi)
  status: StatusDistribusi;
}

export class KonfirmasiDistribusiDto {
  @ApiProperty({ enum: [StatusDistribusi.DITERIMA, StatusDistribusi.BERMASALAH] })
  @IsEnum(StatusDistribusi)
  status: StatusDistribusi;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatanGuru?: string;
}
