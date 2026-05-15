import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKelasDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;
}

export class UpdateKelasDto extends CreateKelasDto {}

import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkCreateKelasDto {
  @ApiProperty({ type: [CreateKelasDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKelasDto)
  kelas: CreateKelasDto[];
}
