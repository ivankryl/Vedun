// src/surveys/surveys.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto';

type Segment = 'SMALL' | 'MEDIUM' | 'LARGE';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveSegmentFromInsured(insured: { size?: string | null }): Segment {
    const raw = (insured.size ?? '').trim().toUpperCase();

    if (raw === '1') return 'SMALL';
    if (raw === '2') return 'MEDIUM';
    if (raw === '3') return 'LARGE';

    if (raw === 'SMALL') return 'SMALL';
    if (raw === 'MEDIUM') return 'MEDIUM';
    if (raw === 'LARGE') return 'LARGE';

    throw new BadRequestException('Cannot determine segment from insured.size');
  }

  private async findSurveyIdBySegment(segment: Segment): Promise<string> {
    const survey = await this.prisma.survey.findFirst({
      where: { title: segment }, // ожидаем Survey.title = 'SMALL' | 'MEDIUM' | 'LARGE'
      select: { id: true },
    });

    if (!survey) {
      throw new NotFoundException(
        `Survey template not found for segment: ${segment} (expected Survey.title="${segment}")`,
      );
    }

    return survey.id;
  }

  async createLinkForOrgAutoSurvey(orgId: string, userId: string, dto: CreateSurveyLinkDto) {
    const insured = await this.prisma.insured.findFirst({
      where: { id: dto.insuredId, orgId },
      select: { id: true, size: true },
    });

    if (!insured) {
      throw new NotFoundException('Insured not found for this organization');
    }

    const segment = this.resolveSegmentFromInsured(insured);
    const surveyId = await this.findSurveyIdBySegment(segment);

    const link = await this.prisma.surveyLink.create({
      data: {
        id: randomUUID(),
        token: randomUUID(),
        surveyId,
        insuredId: insured.id,
        createdBy: userId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      select: { id: true, token: true, createdAt: true, expiresAt: true },
    });

    return link;
  }
}
