// src/surveys/dto/create-survey-link.dto.ts
import { IsISO8601, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateSurveyLinkDto {
  @IsString()
  insureeId!: string;

  @IsOptional()
  @IsIn(['v2', 'v3'])
  version?: 'v2' | 'v3';

  @IsOptional()
  @IsISO8601()
  expiresAt?: string; // ISO date-time
}
