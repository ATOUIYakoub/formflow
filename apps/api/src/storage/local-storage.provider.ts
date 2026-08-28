import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { StorageProvider, StoredFile } from './storage.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    // Use absolute URL so links work from the frontend origin
    this.baseUrl = process.env.UPLOAD_BASE_URL || `http://localhost:${process.env.API_PORT || 3001}/uploads`;

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<StoredFile> {
    const extension = extname(file.originalname);
    const key = `${randomUUID()}${extension}`;
    const filepath = join(this.uploadDir, key);

    writeFileSync(filepath, file.buffer);

    return {
      key,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `${this.baseUrl}/${key}`,
    };
  }

  async delete(key: string): Promise<void> {
    const filepath = join(this.uploadDir, key);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}