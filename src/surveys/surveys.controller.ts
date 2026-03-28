// src/surveys/surveys.controller.ts
import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { SurveysService } from './surveys.service';
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post('links')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('BROKER', 'ADMIN')
  async createLink(@Req() req: any, @Body() dto: CreateSurveyLinkDto) {
    // dto.version ожидаем 'v2' | 'v3' (опционально); сервис сам подставит 'v2', если не передано
    const link = await this.surveysService.createLinkForOrgAutoSurvey(
      req.user.orgId,
      req.user.id,
      dto,
    );

    const base =
      process.env.PUBLIC_FRONTEND_URL && process.env.PUBLIC_FRONTEND_URL.trim() !== ''
        ? process.env.PUBLIC_FRONTEND_URL.replace(/\/$/, '')
        : 'https://vedun-f.onrender.com';

    return {
      uuid: link.uuid,
      token: link.token, // оставляем для обратной совместимости
      url: `${base}/s/${link.uuid}`, // публичная ссылка по uuid
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    };
  }

  @Delete('links/:uuid')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('BROKER', 'ADMIN')
  async deleteLink(@Req() req: any, @Param('uuid') uuid: string) {
    await this.surveysService.deleteSurveyLink(req.user.id, uuid);
    return { ok: true };
  }
}
