import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Ayat Branch' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  name?: string;

  @ApiPropertyOptional({ example: 'AYAT-01' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  code?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  city?: string;

  @ApiPropertyOptional({ example: 'Ayat Zone 3, Near Ayat Roundabout' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  location?: string;

  @ApiPropertyOptional({ example: 'Ayat Square Commercial Complex, Ground Floor, Addis Ababa' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  address?: string;

  @ApiPropertyOptional({ example: '+251-911-010-001' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ayat@michupharmacy.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Sr. Tigist Mengistu' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  manager?: string;

  @ApiPropertyOptional({ example: '24 Hours (Daily)' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  openingHours?: string;

  @ApiPropertyOptional({ example: 9.0125 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 38.8654 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPlaceholderCoords?: boolean;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
