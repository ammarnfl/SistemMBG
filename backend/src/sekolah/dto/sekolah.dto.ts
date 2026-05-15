import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSekolahDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  alamat: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinsi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kabupatenKota?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kecamatan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dapurId?: string;

  /**
   * Email is used to auto-create the GURU user for this sekolah.
   * Only required on CREATE, not on UPDATE.
   */
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

/**
 * On update, only sekolah model fields are allowed.
 * Email is NOT accepted (it belongs to the User, not Sekolah model).
 */
export class UpdateSekolahDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provinsi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kabupatenKota?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kecamatan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dapurId?: string;
}
