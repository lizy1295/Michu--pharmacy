// src/products/products.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import {
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'prescriptionRequired', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() filter: ProductFilterDto) {
    return this.productsService.findAll(filter);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name, brand, or category' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search term',
  })
  search(@Query('q') q: string) {
    return this.productsService.search(q);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({
    name: 'category',
    description: 'Product category',
  })
  findByCategory(
    @Param('category') category: string,
  ) {
    return this.productsService.findByCategory(category);
  }

  @Get('brand/:brand')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiParam({
    name: 'brand',
    description: 'Product brand',
  })
  findByBrand(
    @Param('brand') brand: string,
  ) {
    return this.productsService.findByBrand(brand);
  }

  @Get('filter/price')
  @ApiOperation({ summary: 'Filter products by price range' })
  @ApiQuery({
    name: 'min',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'max',
    required: false,
    type: Number,
  })
  findByPriceRange(
    @Query('min') min?: string,
    @Query('max') max?: string,
  ) {
    return this.productsService.findByPriceRange(
      min ? Number(min) : 0,
      max ? Number(max) : 999999,
    );
  }

  @Get('stats/top-selling')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopSelling(@Query('limit') limit?: string) {
    return this.productsService.getTopSelling(limit ? Number(limit) : 10);
  }

  @Get('stats/low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  getLowStock(@Query('threshold') threshold?: string) {
    return this.productsService.getLowStock(threshold ? Number(threshold) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(id);
  }
}
