import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  patientName!: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsEmail()
  @SanitizeString()
  patientEmail!: string;

  @ApiPropertyOptional({ example: 'Dr. Solomon Bekele' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  doctorName?: string;

  @ApiPropertyOptional({ example: 'MED-12345' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  doctorLicense?: string;

  @ApiProperty({ example: '/uploads/prescriptions/1720000000000-rx.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiPropertyOptional({ example: 'Please prepare refill for 30 days.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  notes?: string;
}
