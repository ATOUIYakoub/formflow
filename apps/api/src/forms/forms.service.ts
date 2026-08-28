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
      },
    });

    if (!form) throw new NotFoundException('Form not found');
    if (form.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return form;
  }

  async saveFields(id: string, fields: any[], userId: string) {
    // Ensure ownership
    await this.findOne(id, userId);

    // Run in a transaction to replace all fields safely
    return this.prisma.$transaction(async (prisma) => {
      // 1. Delete existing fields for this form
      await prisma.formField.deleteMany({
        where: { formId: id },
      });

      // 2. Insert new fields
      if (fields && fields.length > 0) {
        await prisma.formField.createMany({
          data: fields.map((field, index) => ({
            formId: id,
            type: field.type,
            label: field.label,
            description: field.description || null,
            placeholder: field.placeholder || null,
            required: field.required || false,
            position: index,
            options: field.options || null,
            validation: field.validation || null,
          })),
        });
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

  async publish(id: string, userId: string) {
    const form = await this.findOne(id, userId);
    
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

  async getPublicForm(slug: string) {
    const form = await this.prisma.form.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!form || form.status !== 'PUBLISHED') {
      throw new NotFoundException('Form not found or not published');
    }

    return form;
  }

  async submitPublicForm(slug: string, answers: { fieldId: string; value: any }[]) {
    const form = await this.getPublicForm(slug);

    // Save submission and answers in a transaction
    return this.prisma.$transaction(async (prisma) => {
      const submission = await prisma.submission.create({
        data: {
          formId: form.id,
          version: form.version,
        },
      });

      if (answers && answers.length > 0) {
        await prisma.submissionAnswer.createMany({
          data: answers.map((ans) => ({
            submissionId: submission.id,
            fieldId: ans.fieldId,
            value: ans.value,
          })),
        });
      }

      return submission;
    });
  }
}
