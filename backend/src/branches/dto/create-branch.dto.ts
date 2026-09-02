import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateBranchDto {
  @ApiProperty({ example: 'Ayat Branch' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  name!: string;

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

  @ApiProperty({ example: 'Ayat Zone 3, Near Ayat Roundabout' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  location!: string;

  @ApiProperty({ example: 'Ayat Square Commercial Complex, Ground Floor, Addis Ababa' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  address!: string;

  @ApiProperty({ example: '+251-911-010-001' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  phone!: string;

  @ApiProperty({ example: 'ayat@michupharmacy.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Sr. Tigist Mengistu' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  manager!: string;

  @ApiProperty({ example: '24 Hours (Daily)' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  openingHours!: string;

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
