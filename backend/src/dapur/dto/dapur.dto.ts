import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDapurDto {
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
  kontak?: string;

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

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateDapurDto {
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
  kontak?: string;

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
}
