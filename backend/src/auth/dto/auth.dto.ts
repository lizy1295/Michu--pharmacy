import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Abebe' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  firstName!: string;

  @ApiProperty({ example: 'Kebede' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  lastName!: string;

  @ApiPropertyOptional({ example: '+251911000000' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  phone?: string;
}

export class LoginDto {
  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '0904040364' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
