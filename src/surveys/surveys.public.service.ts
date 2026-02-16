//
//  surveys.public.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LinkStatus, Prisma, ResponseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto';

@Injectable()
export class SurveysPublicService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getLinkForRender(id: string) {
      return this.getLinkOrThrow(id);
    }

  private async getLinkOrThrow(id: string) {
    const link = await this.prisma.surveyLink.findFirst({
      where: { OR: [{ token: id }, { uuid: id }] },
        select: {
            id: true,
            uuid: true,
            token: true,
            status: true,
            expiresAt: true,
            openedAt: true,
            lastActionAt: true,
            completedAt: true,
            createdAt: true,
            surveyId: true,
            insureeId: true,
            survey: {
              select: {
                id: true,
                title: true,
                version: true,
                schema: true,
              },
            },
          },
    });

    if (!link) throw new NotFoundException('Survey link not found');

    // EXPIRED вычисляем на лету и (опционально) фиксируем в БД
    if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
      if (link.status !== LinkStatus.EXPIRED && link.status !== LinkStatus.COMPLETED) {
        await this.prisma.surveyLink.update({
          where: { id: link.id },
          data: { status: LinkStatus.EXPIRED, lastActionAt: new Date() },
        });
      }
      throw new BadRequestException('Survey link expired');
    }

    if (link.status === LinkStatus.DEACTIVATED) {
      throw new BadRequestException('Survey link deactivated');
    }

    return link;
  }

  async getLinkByToken(token: string) {
    const link = await this.getLinkOrThrow(token);

    // Никогда не возвращаем token наружу
    // Возвращаем uuid как public id + статусы/даты
    return {
      uuid: link.uuid,
      status: link.status,
      expiresAt: link.expiresAt,
      openedAt: link.openedAt,
      completedAt: link.completedAt,
      createdAt: link.createdAt,
      lastActionAt: link.lastActionAt,
      surveyId: link.surveyId,
      insureeId: link.insureeId,
      survey: link.survey,
    };
  }

  async open(token: string) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      // Уже завершён — просто возвращаем текущий статус
      return { status: link.status, openedAt: link.openedAt, completedAt: link.completedAt };
    }

    const updated = await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: {
        status:
          link.status === LinkStatus.CREATED ? LinkStatus.OPENED : link.status,
        openedAt: link.openedAt ?? new Date(),
        lastActionAt: new Date(),
      },
      select: { status: true, openedAt: true, lastActionAt: true },
    });

    return updated;
  }

  async getCurrent(token: string) {
    const link = await this.getLinkOrThrow(token);

    return this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });
  }

  async getSubmitted(token: string) {
    const link = await this.getLinkOrThrow(token);

    return this.prisma.surveyResponse.findFirst({
      where: { linkId: link.id, status: ResponseStatus.SUBMITTED },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async save(token: string, dto: SaveSurveyResponseDto) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      throw new BadRequestException('Survey already completed');
    }

    const completeness =
      dto.completenessPercent == null ? undefined : new Prisma.Decimal(dto.completenessPercent);

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: existing.id },
          data: {
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: completeness,
            lastSavedAt: new Date(),
            status: ResponseStatus.SAVED,
          },
        })
      : await this.prisma.surveyResponse.create({
          data: {
            surveyId: link.surveyId,
            insureeId: link.insureeId,
            linkId: link.id,
            attemptNo: 1,
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: completeness,
            lastSavedAt: new Date(),
            status: ResponseStatus.SAVED,
          },
        });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: { status: LinkStatus.SAVED, lastActionAt: new Date() },
    });

    return response;
  }

  async submit(token: string, dto: SubmitSurveyResponseDto) {
    const link = await this.getLinkOrThrow(token);

    if (link.status === LinkStatus.COMPLETED) {
      throw new BadRequestException('Survey already completed');
    }

    const existing = await this.prisma.surveyResponse.findFirst({
      where: {
        linkId: link.id,
        status: { in: [ResponseStatus.IN_PROGRESS, ResponseStatus.SAVED] },
      },
      orderBy: { attemptNo: 'desc' },
    });

    const response = existing
      ? await this.prisma.surveyResponse.update({
          where: { id: existing.id },
          data: {
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: new Prisma.Decimal(100),
            lastSavedAt: new Date(),
            submittedAt: new Date(),
            status: ResponseStatus.SUBMITTED,
          },
        })
      : await this.prisma.surveyResponse.create({
          data: {
            surveyId: link.surveyId,
            insureeId: link.insureeId,
            linkId: link.id,
            attemptNo: 1,
            answers: dto.answers,
            respondentMeta: dto.respondentMeta,
            completenessPercent: new Prisma.Decimal(100),
            lastSavedAt: new Date(),
            submittedAt: new Date(),
            status: ResponseStatus.SUBMITTED,
          },
        });

    await this.prisma.surveyLink.update({
      where: { id: link.id },
      data: {
        status: LinkStatus.COMPLETED,
        completedAt: new Date(),
        lastActionAt: new Date(),
      },
    });

    return response;
  }
}

