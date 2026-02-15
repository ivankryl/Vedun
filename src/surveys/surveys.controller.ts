//
//  src/surveys/surveys.controller.ts
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
  @Roles('BROKER')
  async createLink(@Req() req: any, @Body() dto: CreateSurveyLinkDto) {
    const link = await this.surveysService.createLinkForOrgAutoSurvey(
      req.user.orgId,
      req.user.id,
      dto,
    );

    const baseUrl =
      process.env.PUBLIC_FRONTEND_URL?.replace(/\/$/, '') ?? 'https://vedun-f.onrender.com';

    return {
      token: link.token,
      url: `${baseUrl}/s/${link.token}`,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    };
  }

  // ✅ Удаление приглашения (surveyLink)
  @Delete('links/:uuid')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('BROKER')
  async deleteLink(@Req() req: any, @Param('uuid') uuid: string) {
    await this.surveysService.deleteSurveyLink(req.user.id, uuid);
    return { ok: true };
  }
}
