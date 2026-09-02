import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateVideoDto {
  @ApiProperty({ example: 'How to Use Blood Pressure Monitor' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  title!: string;

  @ApiPropertyOptional({ example: 'Step-by-step clinical tutorial on using an upper arm blood pressure monitor.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiProperty({ example: 'Tutorials' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  category!: string;

  @ApiPropertyOptional({ example: '/videos/bp-monitor.mp4' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: '/videos/bp-monitor-thumb.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: '5:30' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  duration?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['public', 'private'], example: 'public' })
  @IsOptional()
  @IsEnum(['public', 'private'])
  visibility?: 'public' | 'private';

  @ApiPropertyOptional({ enum: ['draft', 'published'], example: 'published' })
  @IsOptional()
  @IsString()
  status?: 'draft' | 'published';
}
