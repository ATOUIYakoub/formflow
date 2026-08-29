import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RuleOperator, RuleAction } from '@prisma/client';

export class FormRuleDto {
  @ApiProperty({ example: 'source-field-uuid' })
  @IsString()
  sourceFieldId: string;

  @ApiProperty({ enum: RuleOperator, example: RuleOperator.EQUALS })
  @IsEnum(RuleOperator)
  operator: RuleOperator;

  @ApiPropertyOptional({ example: 'yes' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  value?: string;

  @ApiProperty({ enum: RuleAction, example: RuleAction.SHOW })
  @IsEnum(RuleAction)
  action: RuleAction;

  @ApiProperty({ example: 'target-field-uuid' })
  @IsString()
  targetFieldId: string;
}

export class SaveRulesDto {
  @ApiProperty({ type: [FormRuleDto] })
  rules: FormRuleDto[];
}