import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '@prisma/client';

export class FormFieldDto {
  @ApiPropertyOptional({ example: 'uuid-from-client' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: FieldType, example: FieldType.TEXT })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty({ example: 'Email Address', maxLength: 200 })
  @IsString()
  @MaxLength(200, { message: 'Label too long' })
  label: string;

  @ApiPropertyOptional({ example: 'Enter your email', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description too long' })
  description?: string;

  @ApiPropertyOptional({ example: 'you@example.com', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Placeholder too long' })
  placeholder?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ type: [String], example: ['Option 1', 'Option 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: 'Option too long' })
  options?: string[];

  @ApiPropertyOptional({ example: { min: 0, max: 100 } })
  @IsOptional()
  validation?: Record<string, any>;
}

export class SaveFieldsDto {
  @ApiProperty({ type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}