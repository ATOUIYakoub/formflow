export interface StoredFile {
  key: string;           // unique storage key
  filename: string;      // original filename
  mimeType: string;
  size: number;          // bytes
  url: string;           // public URL to access the file
}

export interface StorageProvider {
  upload(file: Express.Multer.File): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}