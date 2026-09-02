import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Antibiotics' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  name!: string;

  @ApiProperty({ example: 'antibiotics' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  slug!: string;

  @ApiPropertyOptional({ example: 'Medications for bacterial infections' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Antibiotics' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  name?: string;

  @ApiPropertyOptional({ example: 'antibiotics' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Medications for bacterial infections' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
