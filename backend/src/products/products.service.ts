// src/products/products.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, FindOptionsWhere } from 'typeorm';
import { Product } from './product.entity';


import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SanitizeString, sanitizeText } from '../common/utils/sanitize.util';

export class CreateProductDto {
  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @MinLength(1)
  @SanitizeString()
  name!: string;

  @ApiProperty({ example: 120.50 })
  @IsNumber()
  price!: number;

  @ApiPropertyOptional({ example: 'Bayer' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Analgesics' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  category?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ example: 'Pain reliever' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: object;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  expiryDate?: Date | string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Paracetamol 500mg' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  name?: string;

  @ApiPropertyOptional({ example: 120.50 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'Bayer' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Analgesics' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  category?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ example: 'Pain reliever' })
  @IsOptional()
  @IsString()
  @SanitizeString()
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: object;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  expiryDate?: Date | string;
}

export class ProductFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  prescriptionRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}


  async findAll(filter?: ProductFilterDto): Promise<ProductListResponse> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.productsRepo.createQueryBuilder('product');

    if (filter?.search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.brand) LIKE LOWER(:search))',
        { search: `%${filter.search}%` }
      );
    }

    if (filter?.category) {
      const cat = filter.category.trim().toLowerCase();
      const variants = [cat];
      if (cat.endsWith('s')) {
        variants.push(cat.slice(0, -1));
      } else {
        variants.push(cat + 's');
      }
      query.andWhere('LOWER(product.category) IN (:...categoryVariants)', { categoryVariants: variants });
    }

    if (filter?.brand) {
      query.andWhere('LOWER(product.brand) = LOWER(:brand)', { brand: filter.brand });
    }

    if (filter?.minPrice !== undefined) {
      query.andWhere('CAST(product.price AS DECIMAL) >= :minPrice', { minPrice: filter.minPrice });
    }

    if (filter?.maxPrice !== undefined) {
      query.andWhere('CAST(product.price AS DECIMAL) <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter?.status) {
      query.andWhere('product.status = :status', { status: filter.status });
    }

    if (filter?.prescriptionRequired !== undefined) {
      query.andWhere('product.prescriptionRequired = :prescriptionRequired', { prescriptionRequired: filter.prescriptionRequired });
    }

    const [data, total] = await query
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async findOne(id: number): Promise<Product> {
    if (!id) {
      throw new BadRequestException('Product id is required');
    }

    const product = await this.productsRepo.findOne({
      where: { id } as FindOptionsWhere<Product>,
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }


  async findByCategory(category: string): Promise<Product[]> {
    if (!category) {
      throw new BadRequestException('Category is required');
    }

    return this.productsRepo.find({
      where: { category },
      order: { name: 'ASC' },
    });
  }


  async findByBrand(brand: string): Promise<Product[]> {
    if (!brand) {
      throw new BadRequestException('Brand is required');
    }

    return this.productsRepo.find({
      where: { brand },
      order: { name: 'ASC' },
    });
  }


  async findByPriceRange(min: number, max: number): Promise<Product[]> {
    if (min < 0 || max < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (min > max) {
      throw new BadRequestException('Minimum price cannot exceed maximum price');
    }

    return this.productsRepo.find({
      where: { price: Between(min, max) },
      order: { price: 'ASC' },
    });
  }


  async create(productData: CreateProductDto): Promise<Product> {
    if (!productData.name?.trim()) {
      throw new BadRequestException('Product name is required');
    }

    if (productData.price == null || productData.price < 0) {
      throw new BadRequestException('Invalid price');
    }

    const product = this.productsRepo.create({
      name: sanitizeText(productData.name),
      price: productData.price,
      brand: productData.brand ? sanitizeText(productData.brand) : undefined,
      category: productData.category ? sanitizeText(productData.category) : undefined,
      prescriptionRequired: productData.prescriptionRequired ?? false,
      stock: productData.stock ?? 0,
      description: productData.description ? sanitizeText(productData.description) : undefined,
      imageUrl: productData.imageUrl,
      attributes: productData.attributes ?? {},
      status: productData.status || 'active',
      expiryDate: productData.expiryDate ? new Date(productData.expiryDate) : undefined,
    });

    return this.productsRepo.save(product);
  }


  async update(id: number, updateData: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateData.name !== undefined) product.name = sanitizeText(updateData.name);
    if (updateData.price !== undefined) product.price = updateData.price;
    if (updateData.brand !== undefined) product.brand = sanitizeText(updateData.brand);
    if (updateData.category !== undefined) product.category = sanitizeText(updateData.category);
    if (updateData.prescriptionRequired !== undefined) product.prescriptionRequired = updateData.prescriptionRequired;
    if (updateData.stock !== undefined) product.stock = updateData.stock;
    if (updateData.description !== undefined) product.description = sanitizeText(updateData.description);
    if (updateData.imageUrl !== undefined) product.imageUrl = updateData.imageUrl;
    if (updateData.attributes !== undefined) product.attributes = updateData.attributes;
    if (updateData.status !== undefined) product.status = updateData.status;
    if (updateData.expiryDate !== undefined) product.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : undefined;

    return this.productsRepo.save(product);
  }


  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);

    await this.productsRepo.remove(product);

    return {
      message: `Product "${product.name}" deleted`,
    };
  }


  async search(query: string): Promise<Product[]> {
    if (!query?.trim()) {
      throw new BadRequestException('Search query is required');
    }

    return this.productsRepo.find({
      where: [
        { name: ILike(`%${query}%`) },
        { brand: ILike(`%${query}%`) },
        { category: ILike(`%${query}%`) },
      ],
      order: { name: 'ASC' },
    });
  }


  async getTopSelling(limit = 10): Promise<Product[]> {
    return this.productsRepo.find({
      order: { stock: 'ASC' },
      take: limit,
    });
  }


  async getLowStock(threshold = 10): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        stock: Between(0, threshold),
      },
      order: { stock: 'ASC' },
    });
  }
}
