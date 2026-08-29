import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailService, SubmissionNotificationData } from './email.service';

export interface NotificationJobData {
  type: 'submission';
  to: string;
  data: SubmissionNotificationData;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.notificationQueue.waitUntilReady();
  }

  async queueSubmissionNotification(
    to: string,
    data: SubmissionNotificationData,
    options: { delay?: number; attempts?: number; backoff?: number } = {}
  ): Promise<void> {
    await this.notificationQueue.add('submission', { type: 'submission', to, data }, {
      attempts: options.attempts ?? 3,
      backoff: {
        type: 'exponential',
        delay: options.backoff ?? 5000,
      },
      delay: options.delay ?? 0,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }

  async retryFailedJobs(): Promise<number> {
    const failedJobs = await this.notificationQueue.getFailed();
    let retried = 0;
    for (const job of failedJobs) {
      await job.retry();
      retried++;
    }
    return retried;
  }
}