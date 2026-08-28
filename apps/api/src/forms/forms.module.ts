import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PublicFormsController } from './public-forms.controller';

@Module({
  controllers: [FormsController, PublicFormsController],
  providers: [FormsService],
})
export class FormsModule {}
