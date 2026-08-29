import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface SubmissionNotificationData {
  formName: string;
  formSlug: string;
  submissionId: string;
  submittedAt: Date;
  answers: { label: string; value: string }[];
  respondentEmail?: string;
  baseUrl: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private submissionTemplate: handlebars.TemplateDelegate;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'localhost',
      port: parseInt(this.config.get('SMTP_PORT') || '587', 10),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });

    const templatePath = join(process.cwd(), 'src', 'notification', 'templates', 'submission.hbs');
    const templateSource = readFileSync(templatePath, 'utf-8');
    this.submissionTemplate = handlebars.compile(templateSource);
  }

  async sendSubmissionNotification(to: string, data: SubmissionNotificationData): Promise<void> {
    const html = this.submissionTemplate(data);

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM') || 'FormFlow <noreply@formflow.io>',
      to,
      subject: `New submission: ${data.formName}`,
      html,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}