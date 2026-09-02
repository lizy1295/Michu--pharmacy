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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

import {
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from './products.service';

const PRODUCT_UPLOAD_PATH = './uploads/products';
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

if (!existsSync(PRODUCT_UPLOAD_PATH)) {
  mkdirSync(PRODUCT_UPLOAD_PATH, { recursive: true });
}

function productImageFilename(req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
  const safeName = file.originalname
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '');
  const fileExtension = extname(safeName) || extname(file.originalname);
  callback(null, `${Date.now()}-${safeName}${fileExtension}`);
}

function productImageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const extension = extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.'), false);
  }
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) { }

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

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a product image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: PRODUCT_UPLOAD_PATH,
        filename: productImageFilename,
      }),
      fileFilter: productImageFileFilter,
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file was uploaded.');
    }

    return {
      message: 'Image uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `/uploads/products/${file.filename}`,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  create(
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.remove(id);
  }
}