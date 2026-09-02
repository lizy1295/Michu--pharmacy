import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { PrescriptionsService, CreatePrescriptionDto, UpdatePrescriptionStatusDto } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@michu/shared';

const PRESCRIPTION_UPLOAD_PATH = './uploads/prescriptions';
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
];
const ALLOWED_EXTENSIONS = [
  '.jpeg',
  '.jpg',
  '.png',
  '.gif',
  '.pdf',
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
];

if (!existsSync(PRESCRIPTION_UPLOAD_PATH)) {
  mkdirSync(PRESCRIPTION_UPLOAD_PATH, { recursive: true });
}

function prescriptionFilename(req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
  const safeName = file.originalname
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '');
  const fileExtension = extname(safeName) || extname(file.originalname);
  callback(null, `${Date.now()}-${safeName}${fileExtension}`);
}

function prescriptionFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  const extension = extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(extension)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Invalid prescription file type. Accept image, PDF, or video.'), false);
  }
}

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all prescriptions' })
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get prescription by ID' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create prescription' })
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.BRANCH_ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update prescription status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePrescriptionStatusDto) {
    return this.prescriptionsService.updateStatus(Number(id), dto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload prescription document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: PRESCRIPTION_UPLOAD_PATH,
        filename: prescriptionFilename,
      }),
      fileFilter: prescriptionFileFilter,
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
    }),
  )
  uploadPrescription(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No prescription file was uploaded.');
    }

    return {
      message: 'Prescription uploaded',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      url: `/uploads/prescriptions/${file.filename}`,
    };
  }
}

