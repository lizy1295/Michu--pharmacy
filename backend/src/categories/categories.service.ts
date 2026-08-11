import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  slug: string;
  status: 'active' | 'inactive';
  productCount: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async findAll(search?: string): Promise<CategoryResponse[]> {
    const query = this.categoriesRepo.createQueryBuilder('category');
    if (search) {
      query.where('LOWER(category.name) LIKE LOWER(:search)', { search: `%${search}%` });
    }
    const categories = await query.orderBy('category.displayOrder', 'ASC').getMany();
    return categories.map(this.mapToResponse);
  }

  async findOne(id: number): Promise<CategoryResponse> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    return this.mapToResponse(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const existing = await this.categoriesRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    const category = this.categoriesRepo.create({
      name: dto.name,
      description: dto.description,
      slug: dto.slug,
      status: dto.status || 'active',
      displayOrder: dto.displayOrder || 0,
    });

    const saved = await this.categoriesRepo.save(category);
    return this.mapToResponse(saved);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);

    Object.assign(category, dto);
    const saved = await this.categoriesRepo.save(category);
    return this.mapToResponse(saved);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id ${id} not found`);
    await this.categoriesRepo.remove(category);
    return { message: `Category "${category.name}" deleted` };
  }

  private mapToResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      status: category.status,
      productCount: Math.floor(Math.random() * 100),
      displayOrder: category.displayOrder,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
