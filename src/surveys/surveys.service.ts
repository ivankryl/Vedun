// src/surveys/surveys.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto';

type Segment = 'SMALL' | 'MEDIUM' | 'LARGE';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveSegmentFromInsuree(insuree: { companySize: Segment }): Segment {
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
    orgId: string, // пока не используем: в текущей schema нет orgId у Insuree
    userId: string,
    dto: CreateSurveyLinkDto,
  ) {
    // В schema.prisma сущность называется Insuree, поле — insureeId
    const insuree = await this.prisma.insuree.findFirst({
      where: {
        id: dto.insureeId,
        // минимальная изоляция: страхователь создан этим пользователем (брокером)
        createdById: userId,
      },
      select: { id: true, companySize: true },
    });

    if (!insuree) {
      throw new NotFoundException('Insuree not found (or not accessible for this user)');
    }

    const segment = this.resolveSegmentFromInsuree({
      companySize: insuree.companySize as Segment,
    });

    const surveyId = await this.findSurveyTemplateIdBySegment(segment);

    const link = await this.prisma.surveyLink.create({
      data: {
        token: randomUUID(),
        surveyId,
        insureeId: insuree.id,
        createdById: userId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      select: { id: true, token: true, createdAt: true, expiresAt: true, uuid: true },
    });

    return link;
  }
}
