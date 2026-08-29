import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationJobData } from './notification.service';

@Processor('notifications', { concurrency: 5 })
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { type, to, data } = job.data;

    this.logger.log(`Processing notification job ${job.id} of type ${type} for ${to}`);

    try {
      switch (type) {
        case 'submission':
          await this.emailService.sendSubmissionNotification(to, data);
          break;
        default:
          this.logger.warn(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process notification job ${job.id}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Notification job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(`Notification job ${job?.id} failed:`, error);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Notification job ${job.id} progress: ${progress}%`);
  }
}