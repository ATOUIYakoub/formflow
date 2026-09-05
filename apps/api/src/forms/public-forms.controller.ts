import { Controller, Get, Post, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { FormsService } from './forms.service';
import { AnalyticsService } from './analytics.service';
import { Throttle } from '@nestjs/throttler';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { SubmitFormDto } from './dto/submit-form.dto';

@Controller('public/forms')
export class PublicFormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly analyticsService: AnalyticsService
  ) {}

  @Get(':slug')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 views per minute
  async getPublicForm(@Param('slug') slug: string, @Headers('referer') _referer?: string) {
    const form = await this.formsService.getPublicForm(slug);
    await this.analyticsService.trackView(form.id);
    return form;
  }

  @Post(':slug/start')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 starts per minute
  async trackStart(@Param('slug') slug: string) {
    const form = await this.formsService.getPublicForm(slug);
    await this.analyticsService.trackStart(form.id);
    return { success: true };
  }

  @Post(':slug/submissions')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 submissions per minute
  async submitForm(
    @Param('slug') slug: string,
    @Body(new ValidationPipe()) body: SubmitFormDto
  ) {
    return this.formsService.submitPublicForm(slug, body.answers);
  }
}
