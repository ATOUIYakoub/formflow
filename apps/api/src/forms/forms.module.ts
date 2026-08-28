import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PublicFormsController } from './public-forms.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  controllers: [FormsController, PublicFormsController, SubmissionsController],
  providers: [FormsService, SubmissionsService],
})
export class FormsModule {}
