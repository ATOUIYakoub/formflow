import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFormDto {
  @ApiPropertyOptional({ example: 'Updated Contact Form', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Form name too long' })
  name?: string;

  @ApiPropertyOptional({ example: 'An updated contact form', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description too long' })
  description?: string;
}