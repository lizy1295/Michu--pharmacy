import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

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

@Controller('prescriptions')
export class PrescriptionsController {
  @Post('upload')
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
    };
  }
}
