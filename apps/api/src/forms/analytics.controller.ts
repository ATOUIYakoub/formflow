import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService, AnalyticsFilters } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('forms/:id/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const userId = (req.user as any).id;
    const filters: AnalyticsFilters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    return this.analyticsService.getOverview(formId, userId, filters);
  }

  @Get('submissions-per-day')
  async getSubmissionsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const userId = (req.user as any).id;
    const filters: AnalyticsFilters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    return this.analyticsService.getSubmissionsPerDay(formId, userId, filters);
  }

  @Get('views-per-day')
  async getViewsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const userId = (req.user as any).id;
    const filters: AnalyticsFilters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    return this.analyticsService.getViewsPerDay(formId, userId, filters);
  }

  @Get('starts-per-day')
  async getStartsPerDay(
    @Param('id') formId: string,
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const userId = (req.user as any).id;
    const filters: AnalyticsFilters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    return this.analyticsService.getStartsPerDay(formId, userId, filters);
  }
}