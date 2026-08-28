import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.form.findMany({
      where: {
        workspace: {
          ownerId: userId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        workspace: true,
        fields: {
          orderBy: { position: 'asc' },
        },
        rules: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!form) throw new NotFoundException('Form not found');
    if (form.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return form;
  }

  async saveFields(id: string, fields: any[], userId: string) {
    // Ensure ownership
    await this.findOne(id, userId);

    // Run in a transaction to sync fields safely, preserving field IDs
    // so existing submission answers keep pointing to the right field.
    return this.prisma.$transaction(async (prisma: typeof this.prisma) => {
      const keptIds = (fields || []).map((f: any) => f.id).filter(Boolean);

      // 1. Delete fields that were removed from the form
      await prisma.formField.deleteMany({
        where: { formId: id, ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}) },
      });

      // 2. Upsert each field (create with the client-provided id, or update in place)
      for (const [index, field] of (fields || []).entries()) {
        const existing = await prisma.formField.findUnique({ where: { id: field.id } });
        const data = {
          type: field.type,
          label: field.label,
          description: field.description || null,
          placeholder: field.placeholder || null,
          required: field.required || false,
          position: index,
          options: field.options || null,
          validation: field.validation || null,
        };

        if (existing && existing.formId === id) {
          await prisma.formField.update({ where: { id: existing.id }, data });
        } else {
          await prisma.formField.create({
            data: {
              // Reuse the client-provided id unless it collides with a field
              // from another form, in which case generate a fresh one.
              id: !existing ? field.id : undefined,
              formId: id,
              ...data,
            },
          });
        }
      }

      // Return the updated form with fields
      return prisma.form.findUnique({
        where: { id },
        include: { fields: { orderBy: { position: 'asc' } } },
      });
    });
  }

  async create(data: { name: string; description?: string }, userId: string) {
    // Find the user's first workspace
    const workspace = await this.prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    if (!workspace) {
      throw new NotFoundException('No workspace found for user');
    }

    return this.prisma.form.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: workspace.id,
      },
    });
  }

  async update(id: string, data: { name?: string; description?: string }, userId: string) {
    // Ensure ownership
    await this.findOne(id, userId);

    return this.prisma.form.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    // Ensure ownership
    await this.findOne(id, userId);

    return this.prisma.form.delete({
      where: { id },
    });
  }

  async saveRules(
    id: string,
    rules: { sourceFieldId: string; operator: string; value?: any; action: string; targetFieldId: string }[],
    userId: string
  ) {
    await this.findOne(id, userId);

    // Validate that source/target fields belong to this form
    const fieldIds = new Set(
      (await this.prisma.formField.findMany({ where: { formId: id }, select: { id: true } })).map((f: { id: string }) => f.id)
    );

    for (const rule of rules || []) {
      if (!fieldIds.has(rule.sourceFieldId) || !fieldIds.has(rule.targetFieldId)) {
        throw new NotFoundException('Rule references a field that does not exist on this form');
      }
      if (rule.sourceFieldId === rule.targetFieldId) {
        throw new NotFoundException('A field cannot target itself in a rule');
      }
    }

    // Replace all rules for this form (simple approach, rules have no external references)
    await this.prisma.formRule.deleteMany({ where: { formId: id } });

    if (rules && rules.length > 0) {
      await this.prisma.formRule.createMany({
        data: rules.map((rule) => ({
          formId: id,
          sourceFieldId: rule.sourceFieldId,
          operator: rule.operator as any,
          value: rule.value ?? undefined,
          action: rule.action as any,
          targetFieldId: rule.targetFieldId,
        })),
      });
    }

    return this.prisma.formRule.findMany({
      where: { formId: id },
      orderBy: { createdAt: 'asc' },
    });
  }
// --- Snapshot helpers (versioning) ---

  // The published snapshot: fields + rules + name/description at publish time.
  private buildSnapshot(form: { name: string; description: string | null; fields: any[]; rules: any[] }) {
    return {
      name: form.name,
      description: form.description,
      fields: form.fields.map((f) => ({
        id: f.id,
        type: f.type,
        label: f.label,
        description: f.description,
        placeholder: f.placeholder,
        required: f.required,
        position: f.position,
        options: f.options,
        validation: f.validation,
      })),
      rules: form.rules.map((r) => ({
        sourceFieldId: r.sourceFieldId,
        operator: r.operator,
        value: r.value,
        action: r.action,
        targetFieldId: r.targetFieldId,
      })),
    };
  }

  async publish(id: string, userId: string) {
    const form = await this.findOne(id, userId);
    const snapshot = this.buildSnapshot(form);

    const lastVersion = await this.prisma.formVersion.findFirst({
      where: { formId: id },
      orderBy: { version: 'desc' },
    });

    // Only create a new version if the published structure changed
    if (!lastVersion || JSON.stringify(lastVersion.snapshot) !== JSON.stringify(snapshot)) {
      await this.prisma.formVersion.create({
        data: {
          formId: id,
          version: (lastVersion?.version ?? 0) + 1,
          snapshot,
        },
      });
      // Bump the form's current version number
      await this.prisma.form.update({
        where: { id },
        data: { version: (lastVersion?.version ?? 0) + 1 },
      });
    }

    // Generate a simple unique slug if it doesn't have one
    const slug = form.slug || Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);

    return this.prisma.form.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        slug,
      },
    });
  }

  async unpublish(id: string, userId: string) {
    await this.findOne(id, userId);
    
    return this.prisma.form.update({
      where: { id },
      data: {
        status: 'DRAFT',
      },
    });
  }

  // --- Public Methods (No userId check) ---

  // Serves the latest published version snapshot (NOT the live draft),
  // so edits made after publishing never leak to respondents.
  async getPublicForm(slug: string) {
    const form = await this.prisma.form.findUnique({
      where: { slug },
    });

    if (!form || form.status !== 'PUBLISHED') {
      throw new NotFoundException('Form not found or not published');
    }

    const formVersion = await this.prisma.formVersion.findFirst({
      where: { formId: form.id },
      orderBy: { version: 'desc' },
    });

    if (!formVersion) {
      throw new NotFoundException('Form not found or not published');
    }

    const snapshot = formVersion.snapshot as {
      name: string;
      description: string | null;
      fields: any[];
      rules: any[];
    };

    return {
      id: form.id,
      name: snapshot.name,
      description: snapshot.description,
      fields: snapshot.fields || [],
      rules: snapshot.rules || [],
      version: formVersion.version,
    };
  }

  async submitPublicForm(slug: string, answers: { fieldId: string; value: any }[]) {
    const form = await this.prisma.form.findUnique({
      where: { slug },
    });

    if (!form || form.status !== 'PUBLISHED') {
      throw new NotFoundException('Form not found or not published');
    }

    const formVersion = await this.prisma.formVersion.findFirst({
      where: { formId: form.id },
      orderBy: { version: 'desc' },
    });

    if (!formVersion) {
      throw new NotFoundException('Form not found or not published');
    }

    // Only accept answers for fields that exist in the published snapshot
    const snapshot = formVersion.snapshot as { fields: { id: string }[] };
    const validFieldIds = new Set((snapshot.fields || []).map((f) => f.id));
    const cleanAnswers = (answers || []).filter((a) => validFieldIds.has(a.fieldId));

    // Save submission and answers in a transaction, pinned to the exact version
    return this.prisma.$transaction(async (prisma: typeof this.prisma) => {
      const submission = await prisma.submission.create({
        data: {
          formId: form.id,
          version: formVersion.version,
          formVersionId: formVersion.id,
        },
      });

      if (cleanAnswers.length > 0) {
        await prisma.submissionAnswer.createMany({
          data: cleanAnswers.map((ans) => ({
            submissionId: submission.id,
            fieldId: ans.fieldId,
            value: ans.value,
          })),
        });
      }

      return {
        id: submission.id,
        version: formVersion.version,
      };
    });
  }
}
