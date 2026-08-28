import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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

if (!existsSync(DOCTOR_UPLOAD_PATH)) {
  mkdirSync(DOCTOR_UPLOAD_PATH, { recursive: true });
}

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  create(@Body() data: any) {
    return this.doctorsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.doctorsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.remove(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: DOCTOR_UPLOAD_PATH,
        filename: (req, file, cb) => {
          const safeName = file.originalname.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.\-_]/g, '');
          cb(null, `${Date.now()}-${safeName}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    return {
      message: 'Image uploaded successfully',
      url: `/uploads/doctors/${file.filename}`,
    };
  }
}
