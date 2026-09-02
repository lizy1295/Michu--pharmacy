import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdateAdvertisementDto {
  @ApiPropertyOptional({ example: 'Summer Health Sale' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  title?: string;

  @ApiPropertyOptional({ example: 'Up to 30% off on supplements and vitamins.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiPropertyOptional({ enum: ['image', 'video'], example: 'image' })
  @IsOptional()
  @IsEnum(['image', 'video'])
  mediaType?: 'image' | 'video';

  @ApiPropertyOptional({ example: '/ads/summer-sale.jpg' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ example: '/ads/summer-sale-thumb.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: '/products?category=Supplements' })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiPropertyOptional({ example: 'homepage' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  targetPage?: string;

  @ApiPropertyOptional({ example: 'hero_banner' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  position?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'expired'], example: 'published' })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'published' | 'expired';

  @ApiPropertyOptional({ example: 'Admin' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  createdBy?: string;
}
