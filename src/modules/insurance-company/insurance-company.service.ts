//  insurance-company.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsuranceCompany } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  CreateInsuranceCompanyDto,
  UpdateInsuranceCompanyDto,
} from './insurance-company.dto';

@Injectable()
export class InsuranceCompanyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInsuranceCompanyDto, brokerId: string): Promise<InsuranceCompany> {
    // email должен быть уникальным среди пользователей
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email уже зарегистрирован в системе');
    }

    // ВАЖНО: если taxId/registrationId не @unique в schema.prisma,
    // замените findUnique на findFirst (см. комментарии ниже).
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
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) создаём страховую компанию
        const insuranceCompany = await tx.insuranceCompany.create({
          data: {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            taxId: dto.taxId,
            registrationId: dto.registrationId,
            createdBy: { connect: { id: brokerId } },
          },
        });

        // 2) создаём пользователя-страховщика
        // Если у User есть insuranceCompanyId, можно связать сразу:
        // insuranceCompanyId: insuranceCompany.id
        await tx.user.create({
          data: {
            email: dto.email,
            passwordHash: hashedPassword,
            fullName: dto.name,
            role: 'INSURER',
            companyName: dto.name,
            phone: dto.phone,
            insuranceCompanyId: insuranceCompany.id, // включить, если поле есть в Prisma
          },
        });

        return insuranceCompany;
      });

      // TODO: отправка tempPassword на email (сделаете позже)
      return result;
    } catch (error: any) {
      throw new BadRequestException(
        `Ошибка при создании страховой компании: ${error?.message ?? String(error)}`,
      );
    }
  }

  async getAll(brokerId: string): Promise<InsuranceCompany[]> {
    return this.prisma.insuranceCompany.findMany({
      where: { createdById: brokerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, brokerId: string): Promise<InsuranceCompany> {
    const insuranceCompany = await this.prisma.insuranceCompany.findUnique({
      where: { id },
    });

    if (!insuranceCompany) throw new NotFoundException('Страховая компания не найдена');
    if (insuranceCompany.createdById !== brokerId) {
      throw new ForbiddenException('У вас нет доступа к этой страховой компании');
    }

    return insuranceCompany;
  }

  async update(id: string, dto: UpdateInsuranceCompanyDto, brokerId: string): Promise<InsuranceCompany> {
    await this.getById(id, brokerId);

    if (dto.taxId) {
      const existing = await this.prisma.insuranceCompany
        .findUnique({ where: { taxId: dto.taxId } })
        .catch(() => null);

      if (existing && existing.id !== id) {
        throw new BadRequestException('Этот ИНН уже используется другой компанией');
      }
    }

    if (dto.registrationId) {
      const existing = await this.prisma.insuranceCompany
        .findUnique({ where: { registrationId: dto.registrationId } })
        .catch(() => null);

      if (existing && existing.id !== id) {
        throw new BadRequestException('Этот ОГРН уже используется другой компанией');
      }
    }

    return this.prisma.insuranceCompany.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, brokerId: string): Promise<void> {
    await this.getById(id, brokerId);

    const accessCount = await this.prisma.insuranceAccess.count({
      where: { insuranceCompanyId: id, revokedAt: null },
    });

    if (accessCount > 0) {
      throw new BadRequestException(
        'Нельзя удалить страховщика, пока у него есть активные доступы к страхователям. ' +
          'Сначала отзовите все доступы.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.insuranceAccess.deleteMany({ where: { insuranceCompanyId: id } });
      await tx.insuranceCompany.delete({ where: { id } });
    });
  }

  async getByEmail(email: string): Promise<InsuranceCompany | null> {
    return this.prisma.insuranceCompany.findUnique({ where: { email } }).catch(() => null);
  }
}

