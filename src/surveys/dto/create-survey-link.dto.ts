// src/surveys/dto/create-surveys-link.dto.ts

import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateSurveyLinkDto {
  @IsString()
  surveyId!: string;

  @IsString()
  insuredId!: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string; // ISO date-time
}
