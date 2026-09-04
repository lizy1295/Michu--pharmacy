import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Solomon' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  firstName!: string;

  @ApiProperty({ example: 'Bekele' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  lastName!: string;

  @ApiProperty({ example: 'General Medicine & Pharmacology' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  specialization!: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiProperty({ example: 'dr.solomon@michupharmacy.com' })
  @IsEmail()
  contactEmail!: string;

  @ApiPropertyOptional({ example: '+251-911-555-123' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Senior clinical pharmacist and medical consultant with over 12 years of experience.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  bio?: string;

  @ApiPropertyOptional({ example: ['Amharic', 'English', 'Oromiffa'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: ['EFDA Licensed Clinical Pharmacist', 'PharmD', 'Board Certified Pharmacotherapy Specialist'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ example: '/uploads/doctors/doctor-1.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  availableForConsultation?: boolean;
}
