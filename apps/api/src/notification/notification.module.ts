import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: config.get('REDIS_PORT') || 6379,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [NotificationProcessor, NotificationService, EmailService],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}