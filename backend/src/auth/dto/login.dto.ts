import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Email tidak valid.' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong.' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter.' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong.' })
  password: string;
}
