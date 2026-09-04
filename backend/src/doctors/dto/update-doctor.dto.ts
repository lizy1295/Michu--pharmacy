import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'Solomon' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Bekele' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'General Medicine & Pharmacology' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  specialization?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'dr.solomon@michupharmacy.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

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
