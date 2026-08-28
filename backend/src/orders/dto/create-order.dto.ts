import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';
import { SanitizeString } from '../../common/utils/sanitize.util';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  id!: number;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  name!: string;

  @ApiProperty({ example: 45.0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 2 })
  @IsInt({ message: 'Item quantity must be a positive integer.' })
  @Min(1, { message: 'Item quantity must be at least 1.' })
  @IsPositive({ message: 'Item quantity must be positive.' })
  quantity!: number;

  @ApiPropertyOptional({ example: '500mg' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  dosage?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional({ example: 'medicine' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  imageType?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  customerName!: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsString()
  @SanitizeString()
  customerEmail!: string;

  @ApiProperty({ example: '+251911000001' })
  @IsString()
  @SanitizeString()
  customerPhone!: string;

  @ApiProperty({ example: 'Addis Ababa, Bole' })
  @IsString()
  @SanitizeString()
  shippingAddress!: string;

  @ApiProperty({ type: [OrderItemDto], example: [{ id: 1, name: 'Paracetamol 500mg', price: 45, quantity: 2 }] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Order items cannot be empty.' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 'Please deliver before 5 PM' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.APPROVED })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'Approved by pharmacist on duty' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  notes?: string;
}
