// src/surveys/surveys.controller.ts
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SurveysService } from './surveys.service';
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto';

@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post('links')
  async createLink(@Req() req: any, @Body() dto: CreateSurveyLinkDto) {
    const link = await this.surveysService.createLinkForOrgAutoSurvey(
      req.user.orgId,
      req.user.userId,
      dto,
    );

    const baseUrl =
      process.env.PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'https://vedun-1.onrender.com';

    return {
      token: link.token,
      url: `${baseUrl}/survey/${link.token}`, // абсолютная ссылка
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    };
  }
}
