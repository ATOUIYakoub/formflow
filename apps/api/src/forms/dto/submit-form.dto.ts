import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionAnswerDto {
  @ApiProperty({ example: 'field-uuid' })
  @IsString()
  fieldId: string;

  // Answers are intentionally untyped: a value may be a string, number,
  // boolean, an array (CHECKBOX) or an object (FILE metadata). The set of
  // acceptable fields is enforced against the published version snapshot in
  // FormsService.submitPublicForm, not here.
  @ApiProperty({ example: 'user@example.com' })
  @IsDefined()
  value: any;
}

export class SubmitFormDto {
  @ApiProperty({ type: [SubmissionAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionAnswerDto)
  answers: SubmissionAnswerDto[];
}
