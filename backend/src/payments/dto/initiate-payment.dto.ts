import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentProviderMethod } from '../entities/payment.entity';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class InitiatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  orderId!: number;

  @ApiProperty({ enum: PaymentProviderMethod, example: PaymentProviderMethod.TELEBIRR })
  @IsEnum(PaymentProviderMethod)
  paymentMethod!: PaymentProviderMethod;

  @ApiPropertyOptional({ example: 'http://localhost:3000/cart' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  returnUrl?: string;
}
