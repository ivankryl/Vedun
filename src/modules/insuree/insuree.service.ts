//  insuree.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsuranceAccessService } from '../insurance-access/insurance-access.service';
import { Insuree, UserRole } from '@prisma/client';
import { CreateInsureeDto, UpdateInsureeDto } from './insuree.dto';

@Injectable()
export class InsureeService {
  constructor(
    private prisma: PrismaService,
    private insuranceAccessService: InsuranceAccessService,
  ) {}

  async create(dto: CreateInsureeDto, brokerId: string): Promise<Insuree> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    // (опционально, но полезно) проверим что user реально брокер
    const broker = await this.prisma.user.findUnique({ where: { id: brokerId } });
    if (!broker) throw new NotFoundException('Пользователь не найден');
    if (broker.role !== 'BROKER' && broker.role !== 'ADMIN') {
      throw new ForbiddenException('Только брокер может создавать страхователей');
    }

    // У вас taxId unique -> Prisma сама упадёт при дубле, но дадим человекочитаемую ошибку
    const existingByTaxId = await this.prisma.insuree.findUnique({
      where: { taxId: dto.taxId },
    });
    if (existingByTaxId) {
      throw new BadRequestException('Страхователь с таким ИНН уже существует в системе');
    }

    // registrationId optional, но если пришёл — проверим уникальность
    if (dto.registrationId) {
      const existingByReg = await this.prisma.insuree.findUnique({
        where: { registrationId: dto.registrationId },
      });
      if (existingByReg) {
        throw new BadRequestException('Страхователь с таким ОГРН уже существует в системе');
      }
    }

    return this.prisma.insuree.create({
      data: {
        name: dto.name,
        taxId: dto.taxId,
        registrationId: dto.registrationId ?? null,
        countryCode: dto.countryCode,
        companySize: dto.companySize,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPosition: dto.contactPosition ?? null,
        phone: dto.phone ?? null,
        createdBy: { connect: { id: brokerId } },
      },
    });
  }

  async getAll(userId: string, userRole: UserRole): Promise<Insuree[]> {
    if (!userId) throw new BadRequestException('userId is required');

    if (userRole === 'BROKER') {
      return this.prisma.insuree.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === 'INSURER') {
      // ключевое отличие от задания: берем insuranceCompanyId из User
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { insuranceCompanyId: true },
      });
      if (!user?.insuranceCompanyId) return [];

      const accesses = await this.prisma.insuranceAccess.findMany({
        where: {
          insuranceCompanyId: user.insuranceCompanyId,
          revokedAt: null,
        },
        select: { insureeId: true },
      });

      const insureeIds = accesses.map((a) => a.insureeId);
      if (insureeIds.length === 0) return [];

      return this.prisma.insuree.findMany({
        where: { id: { in: insureeIds } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === 'ADMIN' || userRole === 'ANALYST') {
      return this.prisma.insuree.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Неизвестная роль пользователя');
  }

  async getById(id: string, userId: string, userRole: UserRole): Promise<Insuree> {
    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    const hasAccess = await this.checkAccess(id, userId, userRole);
    if (!hasAccess) throw new ForbiddenException('У вас нет доступа к этому страхователю');

    return insuree;
  }

  async update(id: string, dto: UpdateInsureeDto, brokerId: string): Promise<Insuree> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    if (insuree.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете редактировать только своих страхователей');
    }

    // защита от попытки обновить уникальные поля “в лоб” (можно разрешить отдельно)
    const { ...data } = dto as any;
    delete data.taxId;
    delete data.registrationId;
    delete data.createdById;

    return this.prisma.insuree.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, brokerId: string): Promise<void> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    if (insuree.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете удалять только своих страхователей');
    }

    // Не обязательно (у вас onDelete: Cascade), но явно — полезно
    await this.insuranceAccessService.deleteAllAccessForInsuree(id);

    await this.prisma.insuree.delete({ where: { id } });
  }

  async checkAccess(insureeId: string, userId: string, userRole: UserRole): Promise<boolean> {
    if (!userId) return false;

    if (userRole === 'ADMIN') return true;

    if (userRole === 'BROKER') {
      const insuree = await this.prisma.insuree.findUnique({
        where: { id: insureeId },
        select: { createdById: true },
      });
      return insuree?.createdById === userId;
    }

    if (userRole === 'INSURER') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { insuranceCompanyId: true },
      });
      if (!user?.insuranceCompanyId) return false;

      return this.insuranceAccessService.checkAccess(insureeId, user.insuranceCompanyId);
    }

    if (userRole === 'ANALYST') {
      // пока так; позже можно ограничить
      return true;
    }

    return false;
  }

  async getByTaxId(taxId: string): Promise<Insuree | null> {
    return this.prisma.insuree.findUnique({ where: { taxId } }).catch(() => null);
  }

  async getByRegistrationId(registrationId: string): Promise<Insuree | null> {
    return this.prisma.insuree.findUnique({ where: { registrationId } }).catch(() => null);
  }
}
