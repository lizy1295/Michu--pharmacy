import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Length,
  ValidateIf,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim().length > 0)
  @IsEmail()
  email?: string;

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
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim().length > 0)
  @IsString()
  @SanitizeString()
  phone?: string;
}

export class LoginDto {
  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim().length > 0)
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '0904040364' })
  @IsOptional()
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim().length > 0)
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

export class ForgotPasswordDto {
  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim().length > 0)
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+251912345678', description: 'Optional phone number for SMS delivery' })
  @IsOptional()
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim().length > 0)
  @IsString()
  phone?: string;
}

export class VerifyOtpDto {
  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+251912345678', description: 'Optional phone number for SMS verification' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6, description: '6-digit OTP verification code' })
  @IsString()
  @Length(6, 6)
  otp!: string;
}

export class ResetPasswordDto {
  @ApiPropertyOptional({ description: 'Short-lived single-use reset token obtained after verifying OTP' })
  @IsOptional()
  @IsString()
  resetToken?: string;

  @ApiPropertyOptional({ description: 'Backward-compatible alias for resetToken' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ minLength: 8, example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

