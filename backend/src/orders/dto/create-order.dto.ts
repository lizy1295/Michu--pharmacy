import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  customerId!: number;

  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MinLength(1)
  customerName!: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsString()
  customerEmail!: string;

  @ApiProperty({ example: '+251911000001' })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ example: 'Addis Ababa, Bole' })
  @IsString()
  shippingAddress!: string;

  @ApiProperty({ example: [] })
  @IsArray()
  items!: any[];

  @ApiProperty({ example: 1000 })
  @IsNumber()
  subtotal!: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 'Please deliver before 5 PM' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.APPROVED })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
