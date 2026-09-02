import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DOCTOR_UPLOAD_PATH = './uploads/doctors';
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

if (!existsSync(DOCTOR_UPLOAD_PATH)) {
  mkdirSync(DOCTOR_UPLOAD_PATH, { recursive: true });
}

function doctorImageFilename(
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

function doctorImageFileFilter(
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

import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create doctor' })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update doctor' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDoctorDto) {
    return this.doctorsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete doctor' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload doctor image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: DOCTOR_UPLOAD_PATH,
        filename: doctorImageFilename,
      }),
      fileFilter: doctorImageFileFilter,
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      message: 'Image uploaded successfully',
      url: `/uploads/doctors/${file.filename}`,
    };
  }
}

