//
//  public-response.dto.ts
import { IsObject, IsOptional, IsNumber } from 'class-validator';

export class SaveSurveyResponseDto {
  @IsObject()
  answers: Record<string, any>;

  @IsOptional()
  @IsNumber()
  completenessPercent?: number;

  @IsOptional()
  @IsObject()
  respondentMeta?: Record<string, any>;
}

export class SubmitSurveyResponseDto {
  @IsObject()
  answers: Record<string, any>;

  @IsOptional()
  @IsObject()
  respondentMeta?: Record<string, any>;
}
