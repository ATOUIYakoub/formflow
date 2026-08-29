import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormDto {
  @ApiProperty({ example: 'Contact Form', maxLength: 200 })
  @IsString()
  @MaxLength(200, { message: 'Form name too long' })
  name: string;

  @ApiPropertyOptional({ example: 'A simple contact form', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description too long' })
  description?: string;
}