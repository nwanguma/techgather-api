import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-uploads.service';

import { Multer } from 'multer';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAttachments(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileUrl = await this.fileUploadService.uploadFile(
      file,
      'attachments',
    );
    return { url: fileUrl };
  }

  @Post('upload/images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatars(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const fileUrl = await this.fileUploadService.uploadFile(file, 'avatars');
    return { url: fileUrl };
  }
}
