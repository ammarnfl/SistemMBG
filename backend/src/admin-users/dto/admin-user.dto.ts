import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sekolahId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dapurId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nisn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kelasId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nisn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kelasId?: string;
}

export class MappingGuruDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;
}

export class MappingPMDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sekolahId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  kelasId: string;
}
