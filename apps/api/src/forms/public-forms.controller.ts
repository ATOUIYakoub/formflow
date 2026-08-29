import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { FormsService } from './forms.service';
import { AnalyticsService } from './analytics.service';

@Controller('public/forms')
export class PublicFormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly analyticsService: AnalyticsService
  ) {}

  @Get(':slug')
  async getPublicForm(@Param('slug') slug: string, @Headers('referer') referer?: string) {
    const form = await this.formsService.getPublicForm(slug);
    await this.analyticsService.trackView(form.id);
    return form;
  }

  @Post(':slug/start')
  async trackStart(@Param('slug') slug: string) {
    const form = await this.formsService.getPublicForm(slug);
    await this.analyticsService.trackStart(form.id);
    return { success: true };
  }

  @Post(':slug/submissions')
  async submitForm(
    @Param('slug') slug: string,
    @Body() body: { answers: { fieldId: string; value: any }[] }
  ) {
    return this.formsService.submitPublicForm(slug, body.answers);
  }
}
