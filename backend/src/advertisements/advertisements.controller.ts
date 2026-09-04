import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

const AD_UPLOAD_PATH = './uploads/advertisements';
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  // Videos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];
const ALLOWED_EXTENSIONS = [
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.ogg',
  '.mov',
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

if (!existsSync(AD_UPLOAD_PATH)) {
  mkdirSync(AD_UPLOAD_PATH, { recursive: true });
}

function adMediaFilename(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const safeName = file.originalname
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '');
  const fileExtension = extname(safeName) || extname(file.originalname);
  callback(null, `${Date.now()}-${safeName}${fileExtension}`);
}

function adMediaFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const ext = extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
}

@ApiTags('Advertisements')
@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly advertisementsService: AdvertisementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all advertisements' })
  findAll() {
    return this.advertisementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by ID' })
  findOne(@Param('id') id: string) {
    return this.advertisementsService.findOne(Number(id));
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload advertisement media (video or image)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AD_UPLOAD_PATH,
        filename: adMediaFilename,
      }),
      fileFilter: adMediaFileFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = extname(file.originalname).toLowerCase();
    const isVideo =
      file.mimetype.startsWith('video/') ||
      ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);

    return {
      message: `${isVideo ? 'Video' : 'Image'} uploaded successfully`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      type: isVideo ? 'video' : 'image',
      url: `/uploads/advertisements/${file.filename}`,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create advertisement' })
  create(@Body() dto: CreateAdvertisementDto) {
    return this.advertisementsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update advertisement' })
  update(@Param('id') id: string, @Body() dto: UpdateAdvertisementDto) {
    return this.advertisementsService.update(Number(id), dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete advertisement' })
  remove(@Param('id') id: string) {
    return this.advertisementsService.remove(Number(id));
  }
}


