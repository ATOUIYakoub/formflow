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
      },
    });

    if (!form) throw new NotFoundException('Form not found');
    if (form.workspace.ownerId !== userId) throw new ForbiddenException('Access denied');

    return form;
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
}
