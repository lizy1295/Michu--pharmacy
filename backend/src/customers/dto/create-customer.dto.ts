import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Abebe Bikila' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'abebe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+251911121314' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Abebe Bikila' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'abebe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911121314' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isActive?: boolean;
}
