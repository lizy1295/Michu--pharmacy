import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { category, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productsRepository.create(product);
    return this.productsRepository.save(newProduct);
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    await this.productsRepository.update(id, product);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productsRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
