import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetJadwalDto {
  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  tanggal: string;

  @ApiProperty()
  @IsString()
  menuId: string;
}
