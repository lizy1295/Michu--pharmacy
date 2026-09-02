import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class CreateInquiryDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  @SanitizeString()
  customerName!: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  customerPhone?: string;

  @ApiProperty({ example: 'What are the operating hours of Ayat Branch?' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @SanitizeString()
  message!: string;
}
