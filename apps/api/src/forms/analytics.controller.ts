import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';

@UseGuards(JwtAuthGuard)
@Controller('forms/:id/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query(new ValidationPipe()) filters: AnalyticsFiltersDto
  ) {
    const userId = (req.user as any).id;
    return this.analyticsService.getOverview(formId, userId, filters);
  }

  @Get('submissions-per-day')
  async getSubmissionsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query(new ValidationPipe()) filters: AnalyticsFiltersDto
  ) {
    const userId = (req.user as any).id;
    return this.analyticsService.getSubmissionsPerDay(formId, userId, filters);
  }

  @Get('views-per-day')
  async getViewsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query(new ValidationPipe()) filters: AnalyticsFiltersDto
  ) {
    const userId = (req.user as any).id;
    return this.analyticsService.getViewsPerDay(formId, userId, filters);
  }

  @Get('starts-per-day')
  async getStartsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query(new ValidationPipe()) filters: AnalyticsFiltersDto
  ) {
    const userId = (req.user as any).id;
    return this.analyticsService.getStartsPerDay(formId, userId, filters);
  }
}