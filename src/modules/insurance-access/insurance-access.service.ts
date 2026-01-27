//  insurance-access.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsuranceAccess } from '@prisma/client';
import { GrantAccessDto, RevokeAccessDto } from './insurance-access.dto';

@Injectable()
export class InsuranceAccessService {
  constructor(private prisma: PrismaService) {}

  /**
   * Предоставить доступ страховщику к страхователю
   */
  async grantAccess(dto: GrantAccessDto, brokerId: string): Promise<InsuranceAccess> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    // 1) страхователь существует
    const insuree = await this.prisma.insuree.findUnique({
      where: { id: dto.insureeId },
    });

    if (!insuree) throw new NotFoundException('Страхователь не найден');

    // 2) только создатель может выдавать доступ
    if (insuree.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете предоставлять доступ только к своим страхователям');
    }

    // 3) страховщик существует
    const insuranceCompany = await this.prisma.insuranceCompany.findUnique({
      where: { id: dto.insuranceCompanyId },
    });

    if (!insuranceCompany) throw new NotFoundException('Страховая компания не найдена');

    // 4) страховщик создан тем же брокером
    if (insuranceCompany.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете предоставлять доступ только своим страховщикам');
    }

    try {
      const existingAccess = await this.prisma.insuranceAccess.findUnique({
        where: {
          insureeId_insuranceCompanyId: {
            insureeId: dto.insureeId,
            insuranceCompanyId: dto.insuranceCompanyId,
          },
        },
      });

      if (existingAccess) {
        if (existingAccess.revokedAt) {
          return await this.prisma.insuranceAccess.update({
            where: { id: existingAccess.id },
            data: { revokedAt: null },
          });
        }
        return existingAccess;
      }

      return await this.prisma.insuranceAccess.create({
        data: {
          insuree: { connect: { id: dto.insureeId } },
          insuranceCompany: { connect: { id: dto.insuranceCompanyId } },
          grantedBy: { connect: { id: brokerId } },
          grantedAt: new Date(),
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Ошибка при предоставлении доступа: ${error?.message ?? String(error)}`,
      );
    }
  }

  /**
   * Отозвать доступ
   */
  async revokeAccess(dto: RevokeAccessDto, brokerId: string): Promise<InsuranceAccess> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    const insuree = await this.prisma.insuree.findUnique({
      where: { id: dto.insureeId },
    });

    if (!insuree) throw new NotFoundException('Страхователь не найден');

    if (insuree.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете отзывать доступ только к своим страхователям');
    }

    const access = await this.prisma.insuranceAccess.findUnique({
      where: {
        insureeId_insuranceCompanyId: {
          insureeId: dto.insureeId,
          insuranceCompanyId: dto.insuranceCompanyId,
        },
      },
    });

    if (!access) throw new NotFoundException('Доступ не найден');
    if (access.revokedAt) throw new BadRequestException('Доступ уже был отозван');

    return await this.prisma.insuranceAccess.update({
      where: { id: access.id },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Проверить активный доступ
   */
  async checkAccess(insureeId: string, insuranceCompanyId: string): Promise<boolean> {
    const access = await this.prisma.insuranceAccess.findUnique({
      where: {
        insureeId_insuranceCompanyId: {
          insureeId,
          insuranceCompanyId,
        },
      },
    });

    return access !== null && access.revokedAt === null;
  }

  async getInsurersForInsuree(insureeId: string, brokerId: string): Promise<InsuranceAccess[]> {
    if (!brokerId) throw new BadRequestException('brokerId is required');

    const insuree = await this.prisma.insuree.findUnique({
      where: { id: insureeId },
    });

    if (!insuree) throw new NotFoundException('Страхователь не найден');

    if (insuree.createdById !== brokerId) {
      throw new ForbiddenException('Вы можете видеть доступ только к своим страхователям');
    }

    return await this.prisma.insuranceAccess.findMany({
      where: { insureeId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async getInsureesForInsurer(insuranceCompanyId: string): Promise<InsuranceAccess[]> {
    return await this.prisma.insuranceAccess.findMany({
      where: { insuranceCompanyId, revokedAt: null },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async getAccessDetails(insureeId: string, insuranceCompanyId: string) {
    return await this.prisma.insuranceAccess.findUnique({
      where: {
        insureeId_insuranceCompanyId: {
          insureeId,
          insuranceCompanyId,
        },
      },
      include: {
        insuree: true,
        insuranceCompany: true,
        grantedBy: {
          select: {
            id: true,
            // ВАЖНО: если в User у вас fullName, замените name -> fullName
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteAllAccessForInsurer(insuranceCompanyId: string): Promise<void> {
    await this.prisma.insuranceAccess.deleteMany({
      where: { insuranceCompanyId },
    });
  }

  async deleteAllAccessForInsuree(insureeId: string): Promise<void> {
    await this.prisma.insuranceAccess.deleteMany({
      where: { insureeId },
    });
  }
}
