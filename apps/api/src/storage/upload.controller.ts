import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageProvider, StoredFile } from './storage.interface';
import { multerConfig } from './multer.config';
import { STORAGE_PROVIDER } from './storage.module';

@Controller('upload')
export class UploadController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<StoredFile> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.storage.upload(file);
  }
}