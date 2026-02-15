// src/surveys/surveys.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto';
import * as crypto from 'crypto';
import { LinkStatus } from '@prisma/client';

type Segment = 'SMALL' | 'MEDIUM' | 'LARGE';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveSegmentFromInsuree(insuree: { companySize: unknown }): Segment {
    const raw = (insuree.companySize ?? '').toString().trim().toUpperCase();

    if (raw === 'SMALL' || raw === 'MEDIUM' || raw === 'LARGE') return raw as Segment;

    throw new BadRequestException('Cannot determine segment from insuree.companySize');
  }

  private async findSurveyTemplateIdBySegment(segment: Segment): Promise<string> {
    const surveyTemplate = await this.prisma.surveyTemplate.findFirst({
      where: { title: segment }, // ожидаем SurveyTemplate.title = 'SMALL' | 'MEDIUM' | 'LARGE'
      select: { id: true },
    });

    if (!surveyTemplate) {
      throw new NotFoundException(
        `Survey template not found for segment: ${segment} (expected SurveyTemplate.title="${segment}")`,
      );
    }

    return surveyTemplate.id;
  }

  async createLinkForOrgAutoSurvey(
    _orgId: string, // пока не используем (в schema нет orgId у Insuree)
    userId: string,
    dto: CreateSurveyLinkDto,
  ) {
    const insuree = await this.prisma.insuree.findFirst({
      where: {
        id: dto.insureeId,
        createdById: userId, // изоляция: только свои страхователи
      },
      select: { id: true, companySize: true },
    });

    if (!insuree) {
      throw new NotFoundException('Insuree not found (or not accessible for this user)');
    }

    const segment = this.resolveSegmentFromInsuree({ companySize: insuree.companySize });
    const surveyId = await this.findSurveyTemplateIdBySegment(segment);

    const token = crypto.randomBytes(32).toString('hex'); // секретный токен (64 hex chars)

    const link = await this.prisma.surveyLink.create({
      data: {
        token,
        surveyId,
        insureeId: insuree.id,
        createdById: userId,
        status: LinkStatus.CREATED,
        lastActionAt: new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      select: { id: true, token: true, createdAt: true, expiresAt: true, uuid: true },
    });

    return link;
  }

  // ✅ отдельный метод класса (НЕ внутри createLinkForOrgAutoSurvey)
  async deleteSurveyLink(userId: string, uuid: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { uuid, createdById: userId },
      select: { id: true },
    });

    if (!link) throw new NotFoundException('Survey link not found (or not accessible)');

    await this.prisma.surveyLink.delete({ where: { id: link.id } });
  }
}
