// src/insured/insured.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { InsuredService } from './insured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInsuredDto } from './dto/create-insured.dto';

type CreateSurveyLinkForInsureeDto = {
  version?: string;      // не ограничиваем 'v2' | 'v3' — готовы к будущим версиям
  expiresAt?: string;    // ISO8601
};

@UseGuards(JwtAuthGuard)
@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  private getUserId(req: any): string {
    const userId = req.user?.userId ?? req.user?.sub ?? req.user?.id;
    if (!userId) throw new ForbiddenException('User id is missing in token3');
    return userId;
  }

  @Get()
  list(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.insuredService.listForUser(userId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.insuredService.getForUserById(userId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateInsuredDto) {
    const userId = this.getUserId(req);
    return this.insuredService.createForUser(userId, dto);
  }

  @Get(':id/survey-links')
  listSurveyLinks(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.insuredService.listSurveyLinksForUserInsuree(userId, id);
  }

  @Post(':id/survey-links')
  createSurveyLink(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CreateSurveyLinkForInsureeDto,
  ) {
    const userId = this.getUserId(req);

    const dto = {
      insureeId: id,
      version: body?.version,     // строковый тег версии (опционально)
      expiresAt: body?.expiresAt, // ISO8601 (опционально)
    };

    return this.insuredService.createSurveyForUserInsuree(userId, dto);
  }
}
