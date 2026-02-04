// insuree.service.ts
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

  private canWriteInsuree(role: UserRole) {
    // ANALYST read-only
    return role === UserRole.ADMIN || role === UserRole.BROKER;
  }

  private canReadAllInsurees(role: UserRole) {
    // ADMIN/ANALYST могут видеть всех
    return role === UserRole.ADMIN || role === UserRole.ANALYST;
  }

  async create(dto: CreateInsureeDto, userId: string): Promise<Insuree> {
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    if (!this.canWriteInsuree(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут создавать страхователей');
    }

    const existingByTaxId = await this.prisma.insuree.findUnique({
      where: { taxId: dto.taxId },
    });
    if (existingByTaxId) {
      throw new BadRequestException('Страхователь с таким ИНН уже существует в системе');
    }

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
        createdBy: { connect: { id: userId } },
      },
    });
  }

  async getAll(userId: string, userRole: UserRole): Promise<Insuree[]> {
    if (!userId) throw new BadRequestException('userId is required');
    if (!userRole) throw new ForbiddenException('User role is missing');

    if (userRole === UserRole.BROKER) {
      return this.prisma.insuree.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === UserRole.INSURER) {
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

    if (this.canReadAllInsurees(userRole)) {
      return this.prisma.insuree.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Недостаточно прав');
  }

  async getById(id: string, userId: string, userRole: UserRole): Promise<Insuree> {
    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    const hasAccess = await this.checkAccess(id, userId, userRole);
    if (!hasAccess) throw new ForbiddenException('У вас нет доступа к этому страхователю');

    return insuree;
  }

  async update(id: string, dto: UpdateInsureeDto, userId: string): Promise<Insuree> {
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    if (!this.canWriteInsuree(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут редактировать страхователей');
    }

    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    const isOwner = insuree.createdById === userId;
    const canEditAny = user.role === UserRole.ADMIN;

    if (!isOwner && !canEditAny) {
      throw new ForbiddenException('Вы можете редактировать только своих страхователей');
    }

    const data = dto as any;
    delete data.taxId;
    delete data.registrationId;
    delete data.createdById;

    return this.prisma.insuree.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    if (!this.canWriteInsuree(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут удалять страхователей');
    }

    const insuree = await this.prisma.insuree.findUnique({ where: { id } });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    const isOwner = insuree.createdById === userId;
    const canDeleteAny = user.role === UserRole.ADMIN;

    if (!isOwner && !canDeleteAny) {
      throw new ForbiddenException('Вы можете удалять только своих страхователей');
    }

    await this.insuranceAccessService.deleteAllAccessForInsuree(id);
    await this.prisma.insuree.delete({ where: { id } });
  }

  async checkAccess(insureeId: string, userId: string, userRole: UserRole): Promise<boolean> {
    if (!userId || !userRole) return false;

    if (userRole === UserRole.ADMIN || userRole === UserRole.ANALYST) return true;

    if (userRole === UserRole.BROKER) {
      const insuree = await this.prisma.insuree.findUnique({
        where: { id: insureeId },
        select: { createdById: true },
      });
      return insuree?.createdById === userId;
    }

    if (userRole === UserRole.INSURER) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { insuranceCompanyId: true },
      });
      if (!user?.insuranceCompanyId) return false;

      return this.insuranceAccessService.checkAccess(insureeId, user.insuranceCompanyId);
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
