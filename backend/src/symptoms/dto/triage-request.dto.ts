import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class TriageRequestDto {
  /**
   * Free-text symptom query or description typed by user (e.g. "chest pain", "weezing", "frequent thirst").
   */
  @ApiPropertyOptional({
    example: 'chest pain',
    description: "Free-text symptom query or description typed by user",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  query?: string;

  /**
   * Optional array of selected symptom tags from the quick select chips.
   */
  @ApiPropertyOptional({
    example: ['Excessive Thirst', 'Frequent Urination'],
    description: 'Array of selected symptom tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  /**
   * Optional category filter for chronic conditions (e.g. "Respiratory", "Cardiovascular").
   */
  @ApiPropertyOptional({
    example: 'Endocrine & Metabolic',
    description: 'Category filter for chronic conditions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
