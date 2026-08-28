import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

@Module({
  controllers: [require('./upload.controller').UploadController],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}