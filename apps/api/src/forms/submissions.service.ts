import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ListSubmissionsOptions {
  page?: number;
  limit?: number;
  search?: string;
  from?: string;
  to?: string;
}

type SnapshotField = { id: string; label: string; type: string };

// Resolve answer labels/types against the submission's own version snapshot,
// so old submissions display correctly even after the form was modified.
function resolveAnswers(answers: any[], snapshot: any) {
  const fieldMap = new Map<string, SnapshotField>(
    ((snapshot?.fields || []) as SnapshotField[]).map((f) => [f.id, f])
  );
  return answers.map((a) => ({
    fieldId: a.fieldId,
    value: a.value,
    label: fieldMap.get(a.fieldId)?.label ?? null,
    type: fieldMap.get(a.fieldId)?.type ?? null,
  }));
}

@Injectable()
export class SubmissionsService {
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

  async list(formId: string, userId: string, options: ListSubmissionsOptions) {
    await this.assertOwnership(formId, userId);

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = { formId };

    // Date range filter
    if (options.from || options.to) {
      where.createdAt = {};
      if (options.from) where.createdAt.gte = new Date(options.from);
      if (options.to) {
        const to = new Date(options.to);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    // Search across answer values (e.g. name, email)
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      const matching = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT DISTINCT s.id
        FROM submissions s
        JOIN submission_answers a ON a.submission_id = s.id
        WHERE s.form_id = ${formId}
          AND a.value::text ILIKE ${'%' + term + '%'}
      `;

      where.id = { in: matching.map((r) => r.id) };

      // Short-circuit: no matches at all
      if (matching.length === 0) {
        return { items: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          answers: true,
          formVersion: true,
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    // Table columns come from the latest published version snapshot
    // (falling back to the current draft fields if never published).
    const latestVersion = await this.prisma.formVersion.findFirst({
      where: { formId },
      orderBy: { version: 'desc' },
    });
    const columns: SnapshotField[] = latestVersion
      ? (((latestVersion.snapshot as any).fields || []) as SnapshotField[]).map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
        }))
      : await this.prisma.formField.findMany({
          where: { formId },
          orderBy: { position: 'asc' },
          select: { id: true, label: true, type: true },
        });

    return {
      items: items.map((s) => ({
        id: s.id,
        version: s.version,
        createdAt: s.createdAt,
        answers: resolveAnswers(s.answers, s.formVersion?.snapshot),
      })),
      columns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(formId: string, submissionId: string, userId: string) {
    await this.assertOwnership(formId, userId);

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        answers: true,
        formVersion: true,
      },
    });

    if (!submission || submission.formId !== formId) {
      throw new NotFoundException('Submission not found');
    }

    return {
      id: submission.id,
      version: submission.version,
      createdAt: submission.createdAt,
      answers: resolveAnswers(submission.answers, submission.formVersion?.snapshot),
    };
  }

  async remove(formId: string, submissionId: string, userId: string) {
    await this.assertOwnership(formId, userId);

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.formId !== formId) {
      throw new NotFoundException('Submission not found');
    }

    await this.prisma.submission.delete({ where: { id: submissionId } });

    return { success: true };
  }
}
