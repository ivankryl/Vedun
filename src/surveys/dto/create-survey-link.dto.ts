// src/surveys/dto/create-survey-link.dto.ts
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateSurveyLinkDto {
  @IsString()
  insureeId!: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string; // ISO date-time
}
