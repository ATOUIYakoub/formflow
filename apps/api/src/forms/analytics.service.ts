import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsOverview {
  views: number;
  starts: number;
  completions: number;
  completionRate: number;
}

export interface SubmissionsPerDay {
  date: string;
  count: number;
}

export interface AnalyticsFilters {
  from?: string;
  to?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private async assertOwnership(formId: string, userId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { workspace: true },
    });

    if (!form) throw new NotFoundException('Form not found');
    if (form.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return form;
  }

  async trackView(formId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.formAnalytics.upsert({
      where: {
        formId_date: {
          formId,
          date: today,
        },
      },
      create: {
        formId,
        date: today,
        views: 1,
      },
      update: {
        views: { increment: 1 },
      },
    });
  }

  async trackStart(formId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.formAnalytics.upsert({
      where: {
        formId_date: {
          formId,
          date: today,
        },
      },
      create: {
        formId,
        date: today,
        starts: 1,
      },
      update: {
        starts: { increment: 1 },
      },
    });
  }

  async getOverview(formId: string, userId: string, filters: AnalyticsFilters = {}): Promise<AnalyticsOverview> {
    await this.assertOwnership(formId, userId);

    const where: any = { formId };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
      }
    }

    const [analytics, completions] = await Promise.all([
      this.prisma.formAnalytics.findMany({ where }),
      this.prisma.submission.count({
        where: {
          formId,
          ...(filters.from || filters.to
            ? {
                createdAt: {
                  ...(filters.from && { gte: new Date(filters.from) }),
                  ...(filters.to && { lte: new Date(new Date(filters.to).setHours(23, 59, 59, 999)) }),
                },
              }
            : {}),
        },
      }),
    ]);

    const views = analytics.reduce((sum, a) => sum + a.views, 0);
    const starts = analytics.reduce((sum, a) => sum + a.starts, 0);
    const completionRate = starts > 0 ? Math.round((completions / starts) * 100) : 0;

    return {
      views,
      starts,
      completions,
      completionRate,
    };
  }

  async getSubmissionsPerDay(formId: string, userId: string, filters: AnalyticsFilters = {}): Promise<SubmissionsPerDay[]> {
    await this.assertOwnership(formId, userId);

    const where: any = { formId };
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const submissions = await this.prisma.submission.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const countsByDate = new Map<string, number>();
    for (const s of submissions) {
      const dateStr = s.createdAt.toISOString().split('T')[0];
      countsByDate.set(dateStr, (countsByDate.get(dateStr) || 0) + 1);
    }

    return Array.from(countsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getViewsPerDay(formId: string, userId: string, filters: AnalyticsFilters = {}): Promise<SubmissionsPerDay[]> {
    await this.assertOwnership(formId, userId);

    const where: any = { formId };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
      }
    }

    const analytics = await this.prisma.formAnalytics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return analytics.map((a) => ({
      date: a.date.toISOString().split('T')[0],
      count: a.views,
    }));
  }

  async getStartsPerDay(formId: string, userId: string, filters: AnalyticsFilters = {}): Promise<SubmissionsPerDay[]> {
    await this.assertOwnership(formId, userId);

    const where: any = { formId };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) {
        const to = new Date(filters.to);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
      }
    }

    const analytics = await this.prisma.formAnalytics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return analytics.map((a) => ({
      date: a.date.toISOString().split('T')[0],
      count: a.starts,
    }));
  }
}