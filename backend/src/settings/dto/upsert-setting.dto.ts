import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpsertSettingDto {
  @ApiProperty({ example: 'website_name' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  key!: string;

  @ApiProperty({ example: 'Michu Pharmacy' })
  @IsNotEmpty()
  value!: any;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  type?: 'string' | 'number' | 'boolean' | 'json';

  @ApiPropertyOptional({ example: 'general' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  category?: 'general' | 'email' | 'payment' | 'delivery' | 'theme' | 'business';

  @ApiPropertyOptional({ example: 'Website name displayed on header' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;
}

export class UpdateSettingValueDto {
  @ApiProperty({ example: 'Michu Pharmacy' })
  @IsNotEmpty()
  value!: any;
}
