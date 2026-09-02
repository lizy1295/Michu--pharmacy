import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdateBusinessSettingsDto {
  @ApiPropertyOptional({ example: 'Michu Pharmacy' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  websiteName?: string;

  @ApiPropertyOptional({ example: '/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'info@michupharmacy.com' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+251-11-123-4567' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: '0904040364,0931325959' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  contactPhones?: string;

  @ApiPropertyOptional({ example: '456' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  emergencyPhone?: string;

  @ApiPropertyOptional({ example: 'Bole Road, Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  address?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number;

  @ApiPropertyOptional({ example: 'ETB' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    twitter?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  businessHours?: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
}
