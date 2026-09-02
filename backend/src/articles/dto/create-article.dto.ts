import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateArticleDto {
  @ApiProperty({ example: 'Understanding Hypertension: Causes, Symptoms, and Prevention' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  title!: string;

  @ApiPropertyOptional({ example: 'understanding-hypertension' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  slug?: string;

  @ApiProperty({ example: '<h3>What is Hypertension?</h3><p>Hypertension is high blood pressure...</p>' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({ example: 'High blood pressure affects millions globally. Learn about the warning signs...' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'article-health' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiProperty({ example: 'Health Tips' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  category!: string;

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
