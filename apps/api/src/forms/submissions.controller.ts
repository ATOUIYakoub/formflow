import { Controller, Get, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SubmissionsService, ListSubmissionsOptions } from './submissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('forms/:formId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  list(
    @Param('formId') formId: string,
    @Query() query: ListSubmissionsOptions,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return this.submissionsService.list(formId, userId, query);
  }

  @Get(':submissionId')
  findOne(
    @Param('formId') formId: string,
    @Param('submissionId') submissionId: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return this.submissionsService.findOne(formId, submissionId, userId);
  }

  @Delete(':submissionId')
  remove(
    @Param('formId') formId: string,
    @Param('submissionId') submissionId: string,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return this.submissionsService.remove(formId, submissionId, userId);
  }
}
