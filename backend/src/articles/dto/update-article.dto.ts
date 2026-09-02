import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Understanding Hypertension: Causes, Symptoms, and Prevention' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  title?: string;

  @ApiPropertyOptional({ example: 'understanding-hypertension' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  slug?: string;

  @ApiPropertyOptional({ example: '<h3>What is Hypertension?</h3><p>Hypertension is high blood pressure...</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'High blood pressure affects millions globally. Learn about the warning signs...' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'article-health' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ example: 'Health Tips' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  category?: string;

  @ApiPropertyOptional({ example: ['hypertension', 'heart health'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'published'], example: 'published' })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: 'Hypertension Guide | Michu Pharmacy' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Learn about hypertension management and prevention tips.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'Dr. Solomon Bekele, PharmD' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  author?: string;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  relatedProductIds?: number[];
}
