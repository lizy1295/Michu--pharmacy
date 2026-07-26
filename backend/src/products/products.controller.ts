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
} from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name' })
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