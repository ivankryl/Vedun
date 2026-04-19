// src/surveys/surveys.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { LinkStatus } from '@prisma/client'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSurveyLinkDto } from './dto/create-survey-link.dto'

type Segment = 'SMALL' | 'MEDIUM' | 'LARGE'

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  // Ищем активный шаблон по версии (v2, v3 и т.д.)
  private async findSurveyTemplateIdByVersion(version: string): Promise<string> {
    const surveyTemplate = await this.prisma.surveyTemplate.findUnique({
      where: { version },
      select: { id: true, status: true },
    })

    if (!surveyTemplate) {
      throw new NotFoundException(`Survey template not found for version: ${version}`)
    }

    if ((surveyTemplate as any).status !== 'ACTIVE') {
      throw new BadRequestException(`Survey template version=${version} is not ACTIVE`)
    }

    return (surveyTemplate as any).id
  }

  private resolveSegmentFromInsuree(insuree: { companySize: unknown }): Segment {
    const raw = (insuree.companySize ?? '').toString().trim().toUpperCase()
    if (raw === 'SMALL' || raw === 'MEDIUM' || raw === 'LARGE') return raw as Segment
    throw new BadRequestException('Cannot determine segment from insuree.companySize')
  }

  private async findSurveyTemplateIdBySegment(segment: Segment): Promise<string> {
    const surveyTemplate = await this.prisma.surveyTemplate.findFirst({
      where: { title: segment }, // ожидаем SurveyTemplate.title = 'SMALL' | 'MEDIUM' | 'LARGE'
      select: { id: true },
    })

    if (!surveyTemplate) {
      throw new NotFoundException(
        `Survey template not found for segment: ${segment} (expected SurveyTemplate.title="${segment}")`,
      )
    }

    return (surveyTemplate as any).id
  }

  // Создание ссылки на опрос (по умолчанию — версия v3)
  async createLinkForOrgAutoSurvey(
    _orgId: string, // пока не используем (в schema нет orgId у Insuree)
    userId: string,
    dto: CreateSurveyLinkDto,
    opts?: { version?: string } // опционально можно переопределить версию
  ) {
    const insuree = await this.prisma.insuree.findFirst({
      where: {
        id: dto.insureeId,
        createdById: userId, // изоляция: только свои страхователи
      },
      select: { id: true, companySize: true },
    })

    if (!insuree) {
      throw new NotFoundException('Insuree not found (or not accessible for this user)')
    }

    // ВАЖНО: создаём ссылку на v3-шаблон (чтобы публичный поток использовал v3 и считал зрелость)
    const version = opts?.version ?? 'v3'
    const surveyId = await this.findSurveyTemplateIdByVersion(version)

    // Если нужна логика по сегментам — можно вернуть её позже:
    // const segment = this.resolveSegmentFromInsuree({ companySize: insuree.companySize })
    // const surveyId = await this.findSurveyTemplateIdBySegment(segment)

    const token = crypto.randomBytes(32).toString('hex') // секретный токен (64 hex chars)

    const expiresAt = dto.expiresAt == null ? undefined : new Date(dto.expiresAt)
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      throw new BadRequestException('Invalid expiresAt')
    }

    const link = await this.prisma.surveyLink.create({
      data: {
        token,
        surveyId,
        insureeId: insuree.id,
        createdById: userId,
        status: LinkStatus.CREATED,
        lastActionAt: new Date(),
        expiresAt,
      },
      select: { id: true, token: true, createdAt: true, expiresAt: true, uuid: true },
    })

    return link
  }

  async deleteSurveyLink(userId: string, uuid: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { uuid, createdById: userId },
      select: { id: true },
    })

    if (!link) throw new NotFoundException('Survey link not found (or not accessible)')

    await this.prisma.surveyLink.delete({ where: { id: (link as any).id } })
  }
}
