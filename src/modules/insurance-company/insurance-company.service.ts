// insurance-company.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma,InsuranceCompany, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  CreateInsuranceCompanyDto,
  UpdateInsuranceCompanyDto,
} from './insurance-company.dto';

@Injectable()
export class InsuranceCompanyService {
  constructor(private prisma: PrismaService) {}

  private canWrite(role: UserRole) {
    // ANALYST read-only
    return role === UserRole.ADMIN || role === UserRole.BROKER;
  }

  private canReadAll(role: UserRole) {
    return role === UserRole.ADMIN || role === UserRole.ANALYST;
  }

  private async getUserOrThrow(userId: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  async create(dto: CreateInsuranceCompanyDto, userId: string): Promise<InsuranceCompany> {
    const user = await this.getUserOrThrow(userId);
    if (!this.canWrite(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут создавать страховые компании');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existingEmail) throw new BadRequestException('Email уже зарегистрирован в системе');

    if (dto.taxId) {
      const existingTaxId = await this.prisma.insuranceCompany
        .findUnique({ where: { taxId: dto.taxId } })
        .catch(() => null);

      if (existingTaxId) {
        throw new BadRequestException('Страховая компания с таким ИНН уже существует');
      }
    }

    if (dto.registrationId) {
      const existingRegId = await this.prisma.insuranceCompany
        .findUnique({ where: { registrationId: dto.registrationId } })
        .catch(() => null);

      if (existingRegId) {
        throw new BadRequestException('Страховая компания с таким ОГРН уже существует');
      }
    }

    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
      const insuranceCompany = await this.prisma.$transaction(async (tx) => {
        const company = await tx.insuranceCompany.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            taxId: dto.taxId,
            registrationId: dto.registrationId,
            createdBy: { connect: { id: userId } },
          },
        });

        await tx.user.create({
          data: {
            email: dto.email,
            passwordHash: hashedPassword,
            fullName: dto.name,
            role: UserRole.INSURER,
            companyName: dto.name,
            phone: dto.phone,
            insuranceCompanyId: company.id,
          },
        });

        return company;
      });

      // TODO: отправка tempPassword на email
      return insuranceCompany;
    } catch (error: any) {
      throw new BadRequestException(
        `Ошибка при создании страховой компании: ${error?.message ?? String(error)}`,
      );
    }
  }

  async getAll(userId: string): Promise<InsuranceCompany[]> {
    const user = await this.getUserOrThrow(userId);

    if (this.canReadAll(user.role)) {
      return this.prisma.insuranceCompany.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (user.role === UserRole.BROKER) {
      return this.prisma.insuranceCompany.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException('Недостаточно прав');
  }

  async getById(id: string, userId: string): Promise<InsuranceCompany> {
    const user = await this.getUserOrThrow(userId);

    const insuranceCompany = await this.prisma.insuranceCompany.findUnique({
      where: { id },
    });
    if (!insuranceCompany) throw new NotFoundException('Страховая компания не найдена');

    if (this.canReadAll(user.role)) return insuranceCompany;

    if (user.role === UserRole.BROKER) {
      if (insuranceCompany.createdById !== userId) {
        throw new ForbiddenException('У вас нет доступа к этой страховой компании');
      }
      return insuranceCompany;
    }

    throw new ForbiddenException('Недостаточно прав');
  }

  async update(id: string, dto: UpdateInsuranceCompanyDto, userId: string): Promise<InsuranceCompany> {
    const user = await this.getUserOrThrow(userId);
    if (!this.canWrite(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут обновлять страховые компании');
    }

    // доступ на обновление: ADMIN — любую, BROKER — только свою
    const current = await this.getById(id, userId);

    if (dto.taxId) {
      const existing = await this.prisma.insuranceCompany
        .findUnique({ where: { taxId: dto.taxId } })
        .catch(() => null);

      if (existing && existing.id !== current.id) {
        throw new BadRequestException('Этот ИНН уже используется другой компанией');
      }
    }

    if (dto.registrationId) {
      const existing = await this.prisma.insuranceCompany
        .findUnique({ where: { registrationId: dto.registrationId } })
        .catch(() => null);

      if (existing && existing.id !== current.id) {
        throw new BadRequestException('Этот ОГРН уже используется другой компанией');
      }
    }

    return this.prisma.insuranceCompany.update({
      where: { id },
      data: dto,
    });
  }

    async delete(id: string, userId: string): Promise<void> {
      const actor = await this.getUserOrThrow(userId);
      if (!this.canWrite(actor.role)) {
        throw new ForbiddenException('Только ADMIN/BROKER могут удалять страховые компании');
      }

      // доступ на удаление: ADMIN — любую, BROKER — только свою
      await this.getById(id, userId);

      const usersCount = await this.prisma.user.count({
        where: { insuranceCompanyId: id },
      });
      if (usersCount > 0) {
        throw new ConflictException(
          `Удаление запрещено: к компании привязаны пользователи (${usersCount}).`,
        );
      }

      const accessCount = await this.prisma.insuranceAccess.count({
        where: { insuranceCompanyId: id, revokedAt: null },
      });
      if (accessCount > 0) {
        throw new BadRequestException(
          'Нельзя удалить страховщика, пока у него есть активные доступы к страхователям. ' +
            'Сначала отзовите все доступы.',
        );
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.insuranceAccess.deleteMany({ where: { insuranceCompanyId: id } });
          await tx.insuranceCompany.delete({ where: { id } });
        });
      } catch (e: any) {
        console.error('Delete insurance company failed', e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma code:', e.code, 'meta:', e.meta);
        }
        throw e;
      }
    }


  async getByEmail(email: string): Promise<InsuranceCompany | null> {
    return this.prisma.insuranceCompany.findUnique({ where: { email } }).catch(() => null);
  }
}
