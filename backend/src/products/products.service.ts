// src/products/products.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { Product } from './product.entity';


export interface CreateProductDto {
  name: string;
  price: number;
  brand?: string;
  category?: string;
  prescriptionRequired?: boolean;
  imageUrl?: string;
  description?: string;
  stock?: number;
  attributes?: object;
}


export interface UpdateProductDto {
  name?: string;
  price?: number;
  brand?: string;
  category?: string;
  prescriptionRequired?: boolean;
  imageUrl?: string;
  description?: string;
  stock?: number;
  attributes?: object;
}


@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}


  // GET ALL PRODUCTS
  findAll(): Promise<Product[]> {
    return this.productsRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }


  // GET SINGLE PRODUCT
  async findOne(id: number): Promise<Product> {

    if (!id) {
      throw new BadRequestException('Product id is required');
    }

    const product = await this.productsRepo.findOneBy({
      id,
    });


    if (!product) {
      throw new NotFoundException(
        `Product with id "${id}" not found`,
      );
    }

    return product;
  }



  // FILTER BY CATEGORY
  findByCategory(category: string): Promise<Product[]> {

    if (!category) {
      throw new BadRequestException(
        'Category is required',
      );
    }


    return this.productsRepo.find({
      where: {
        category,
      },
      order: {
        name: 'ASC',
      },
    });
  }



  // FILTER BY PRICE
  findByPriceRange(
    min: number,
    max: number,
  ): Promise<Product[]> {


    if (min < 0 || max < 0) {
      throw new BadRequestException(
        'Price cannot be negative',
      );
    }


    if (min > max) {
      throw new BadRequestException(
        'Minimum price cannot exceed maximum price',
      );
    }


    return this.productsRepo.find({
      where: {
        price: Between(min, max),
      },
      order: {
        price: 'ASC',
      },
    });
  }




  // CREATE PRODUCT
  async create(
    productData: CreateProductDto,
  ): Promise<Product> {


    if (!productData.name?.trim()) {
      throw new BadRequestException(
        'Product name is required',
      );
    }


    if (
      productData.price == null ||
      productData.price < 0
    ) {
      throw new BadRequestException(
        'Invalid price',
      );
    }



    const product =
      this.productsRepo.create({

        name: productData.name,

        price: productData.price,

        brand: productData.brand,

        category: productData.category,

        prescriptionRequired:
          productData.prescriptionRequired ?? false,

        stock:
          productData.stock ?? 0,

        description:
          productData.description,

        imageUrl:
          productData.imageUrl,

        attributes:
          productData.attributes ?? {},

      });


    return this.productsRepo.save(product);
  }





  // UPDATE PRODUCT
  async update(
    id: number,
    updateData: UpdateProductDto,
  ): Promise<Product> {


    const product =
      await this.findOne(id);


    Object.assign(
      product,
      updateData,
    );


    return this.productsRepo.save(product);
  }




  // DELETE PRODUCT
  async remove(
    id: number,
  ): Promise<{message:string}> {


    const product =
      await this.findOne(id);


    await this.productsRepo.remove(product);


    return {
      message:
        `Product "${product.name}" deleted`,
    };
  }





  // SEARCH PRODUCT
  search(
    query:string,
  ):Promise<Product[]> {


    if (!query?.trim()) {
      throw new BadRequestException(
        'Search query is required',
      );
    }


    return this.productsRepo.find({

      where:{
        name: ILike(`%${query}%`),
      },

      order:{
        name:'ASC',
      },

    });
  }

}