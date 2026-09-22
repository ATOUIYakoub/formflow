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
      useFactory: (config: ConfigService) => {
        // Strip protocol prefix if accidentally included (e.g. "https://host" → "host")
        const rawHost = config.get<string>('REDIS_HOST') || 'localhost';
        const host = rawHost.replace(/^https?:\/\//, '').replace(/^rediss?:\/\//, '');
        const port = Number(config.get('REDIS_PORT')) || 6379;
        const password = config.get<string>('REDIS_PASSWORD');
        const tls = config.get('REDIS_TLS') === 'true';

        return {
          connection: {
            host,
            port,
            ...(password ? { password } : {}),
            ...(tls ? { tls: {} } : {}),
          },
        };
      },
    }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [NotificationProcessor, NotificationService, EmailService],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}