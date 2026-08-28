import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body() createFormData: { name: string; description?: string }, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.create(createFormData, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormData: { name?: string; description?: string }, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.update(id, updateFormData, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.remove(id, userId);
  }
}
