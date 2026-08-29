import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { StorageProvider, StoredFile } from './storage.interface';

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const cleaned = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Limit length
  return cleaned.substring(0, 100);
}

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    this.baseUrl = process.env.UPLOAD_BASE_URL || `http://localhost:${process.env.API_PORT || 3001}/uploads`;

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File): Promise<StoredFile> {
    const safeOriginalName = sanitizeFilename(file.originalname);
    const extension = extname(safeOriginalName).toLowerCase();
    const key = `${randomUUID()}${extension}`;
    const filepath = join(this.uploadDir, key);

    writeFileSync(filepath, file.buffer);

    return {
      key,
      filename: safeOriginalName,
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