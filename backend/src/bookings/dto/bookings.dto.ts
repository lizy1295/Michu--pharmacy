import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  /**
   * Optional FK to the doctors table.
   * If omitted, doctorName is used as-is.
   */
  @ApiPropertyOptional({ example: 3, description: 'Doctor ID from the doctors table' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  doctorId?: number;

  /** Doctor display name (denormalised, always stored even when doctorId is provided). */
  @ApiProperty({ example: 'Dr. Million Negasa (Founder & Chief Pharmacist)' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @SanitizeString()
  doctorName!: string;

  /**
   * Preferred consultation date — ISO 8601 date string (YYYY-MM-DD).
   * Future-date validation is enforced in the service layer.
   */
  @ApiProperty({ example: '2026-10-05' })
  @IsDateString()
  requestedDate!: string;

  @ApiProperty({ example: '10:00 AM' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @SanitizeString()
  requestedTime!: string;

  /** Patient's stated reason / questions for the consultation. */
  @ApiProperty({ example: 'Need guidance on drug interactions for my hypertension medication.' })
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  @SanitizeString()
  reason!: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @SanitizeString()
  customerPhone?: string;

  /**
   * Optional display name for the booking (e.g. "Abebe Bikila").
   * The frontend should pass this from the auth context.
   * customerEmail is always overridden from the verified JWT for security.
   */
  @ApiPropertyOptional({ example: 'Abebe Bikila' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @SanitizeString()
  customerName?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED],
    example: BookingStatus.CONFIRMED,
  })
  @IsEnum([BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.COMPLETED], {
    message: 'status must be one of: confirmed, cancelled, completed',
  })
  status!: BookingStatus.CONFIRMED | BookingStatus.CANCELLED | BookingStatus.COMPLETED;

  @ApiPropertyOptional({ example: 'Confirmed — Dr. Million will call at 10:00 AM.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @SanitizeString()
  adminNotes?: string;
}
