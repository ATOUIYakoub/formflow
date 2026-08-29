import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { SaveFieldsDto } from './dto/form-field.dto';
import { SaveRulesDto } from './dto/form-rule.dto';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body(new ValidationPipe()) dto: CreateFormDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.create(dto, userId);
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

  @Post(':id/fields')
  saveFields(@Param('id') id: string, @Body(new ValidationPipe()) dto: SaveFieldsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.saveFields(id, dto.fields, userId);
  }

  @Post(':id/rules')
  saveRules(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: SaveRulesDto,
    @Req() req: Request
  ) {
    const userId = (req.user as any).id;
    return this.formsService.saveRules(id, dto.rules, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe()) dto: UpdateFormDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.remove(id, userId);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.publish(id, userId);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.formsService.unpublish(id, userId);
  }
}
