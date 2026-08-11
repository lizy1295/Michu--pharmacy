import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@michupharmacy.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6, example: 'AdminPass123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Admin Name' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: '+251911000000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@michupharmacy.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'AdminPass123!' })
  @IsString()
  @MinLength(1)
  password!: string;
}
