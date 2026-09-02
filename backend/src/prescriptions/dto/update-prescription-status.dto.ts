import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class UpdatePrescriptionStatusDto {
  @ApiProperty({ enum: PrescriptionStatus, example: PrescriptionStatus.APPROVED })
  @IsEnum(PrescriptionStatus)
  status!: PrescriptionStatus;

  @ApiPropertyOptional({ example: 'Verified with doctor license database.' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  notes?: string;
}
