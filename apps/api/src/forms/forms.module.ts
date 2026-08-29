import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PublicFormsController } from './public-forms.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [FormsController, PublicFormsController, SubmissionsController, AnalyticsController],
  providers: [FormsService, SubmissionsService, AnalyticsService],
})
export class FormsModule {}
