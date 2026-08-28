import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FormsService } from './forms.service';

@Controller('public/forms')
export class PublicFormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get(':slug')
  getPublicForm(@Param('slug') slug: string) {
    return this.formsService.getPublicForm(slug);
  }

  @Post(':slug/submissions')
  submitForm(
    @Param('slug') slug: string,
    @Body() body: { answers: { fieldId: string; value: any }[] }
  ) {
    return this.formsService.submitPublicForm(slug, body.answers);
  }
}
