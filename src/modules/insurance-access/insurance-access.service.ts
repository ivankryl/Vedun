// insurance-access.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsuranceAccess, UserRole } from '@prisma/client';
import { GrantAccessDto, RevokeAccessDto } from './insurance-access.dto';

@Injectable()
export class InsuranceAccessService {
  constructor(private prisma: PrismaService) {}

  private async getUserOrThrow(userId: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return user;
  }

  private canWrite(role: UserRole) {
    // ANALYST read-only
    return role === UserRole.ADMIN || role === UserRole.BROKER;
  }

  /**
   * Предоставить доступ страховщику к страхователю
   */
  async grantAccess(dto: GrantAccessDto, userId: string): Promise<InsuranceAccess> {
    const user = await this.getUserOrThrow(userId);
    if (!this.canWrite(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут предоставлять доступ');
    }

    const insuree = await this.prisma.insuree.findUnique({
      where: { id: dto.insureeId },
      select: { id: true, createdById: true },
    });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    const insuranceCompany = await this.prisma.insuranceCompany.findUnique({
      where: { id: dto.insuranceCompanyId },
      select: { id: true, createdById: true },
    });
    if (!insuranceCompany) throw new NotFoundException('Страховая компания не найдена');

    // BROKER может работать только со "своими", ADMIN — со всеми
    if (user.role !== UserRole.ADMIN) {
      if (insuree.createdById !== userId) {
        throw new ForbiddenException('Вы можете предоставлять доступ только к своим страхователям');
      }
      if (insuranceCompany.createdById !== userId) {
        throw new ForbiddenException('Вы можете предоставлять доступ только своим страховщикам');
      }
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
            data: {
              revokedAt: null,
              grantedById: userId,
              grantedAt: new Date(),
            },
          });
        }
        return existingAccess;
      }

      return await this.prisma.insuranceAccess.create({
        data: {
          insuree: { connect: { id: dto.insureeId } },
          insuranceCompany: { connect: { id: dto.insuranceCompanyId } },
          grantedBy: { connect: { id: userId } },
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
  async revokeAccess(dto: RevokeAccessDto, userId: string): Promise<InsuranceAccess> {
    const user = await this.getUserOrThrow(userId);
    if (!this.canWrite(user.role)) {
      throw new ForbiddenException('Только ADMIN/BROKER могут отзывать доступ');
    }

    const insuree = await this.prisma.insuree.findUnique({
      where: { id: dto.insureeId },
      select: { id: true, createdById: true },
    });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    if (user.role !== UserRole.ADMIN && insuree.createdById !== userId) {
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
   * Проверить активный доступ (внутренний метод, тут прав не проверяем)
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

  async getInsurersForInsuree(insureeId: string, userId: string): Promise<InsuranceAccess[]> {
    const user = await this.getUserOrThrow(userId);

    const insuree = await this.prisma.insuree.findUnique({
      where: { id: insureeId },
      select: { id: true, createdById: true },
    });
    if (!insuree) throw new NotFoundException('Страхователь не найден');

    // ADMIN/ANALYST могут смотреть всё, BROKER — только своё
    if (user.role === UserRole.BROKER && insuree.createdById !== userId) {
      throw new ForbiddenException('Вы можете видеть доступ только к своим страхователям');
    }
    if (user.role === UserRole.INSURER) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return await this.prisma.insuranceAccess.findMany({
      where: { insureeId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  // Для страховщика список его доступов обычно нужен.
  // Но чтобы не "подделали" insuranceCompanyId в запросе, лучше принимать userId и брать insuranceCompanyId из User.
  async getInsureesForInsurer(userId: string): Promise<InsuranceAccess[]> {
    const user = await this.getUserOrThrow(userId);

    if (user.role !== UserRole.INSURER) {
      throw new ForbiddenException('Только страховщик может получать список доступных страхователей');
    }

    const insurer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { insuranceCompanyId: true },
    });
    if (!insurer?.insuranceCompanyId) return [];

    return await this.prisma.insuranceAccess.findMany({
      where: { insuranceCompanyId: insurer.insuranceCompanyId, revokedAt: null },
      orderBy: { grantedAt: 'desc' },
    });
  }

    async getAccessDetails(insureeId: string, insuranceCompanyId: string, userId: string) {
      if (!userId) throw new BadRequestException('userId is required');

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, insuranceCompanyId: true },
      });
      if (!user) throw new NotFoundException('Пользователь не найден');

      // INSURER: только своя страховая компания
      if (user.role === UserRole.INSURER) {
        if (!user.insuranceCompanyId) {
          throw new ForbiddenException('У страховщика не задана страховая компания');
        }
        if (user.insuranceCompanyId !== insuranceCompanyId) {
          throw new ForbiddenException('Недостаточно прав');
        }
      }

      // BROKER: только если и insuree, и insuranceCompany созданы этим брокером (createdById === userId)
      if (user.role === UserRole.BROKER) {
        const [insuree, insuranceCompany] = await Promise.all([
          this.prisma.insuree.findUnique({
            where: { id: insureeId },
            select: { id: true, createdById: true },
          }),
          this.prisma.insuranceCompany.findUnique({
            where: { id: insuranceCompanyId },
            select: { id: true, createdById: true },
          }),
        ]);

        if (!insuree) throw new NotFoundException('Страхователь не найден');
        if (!insuranceCompany) throw new NotFoundException('Страховая компания не найдена');

        if (insuree.createdById !== userId || insuranceCompany.createdById !== userId) {
          throw new ForbiddenException('Недостаточно прав');
        }
      }

      // ADMIN/ANALYST: read-only можно (как у тебя уже задумано)
      if (user.role !== UserRole.ADMIN && user.role !== UserRole.ANALYST && user.role !== UserRole.BROKER && user.role !== UserRole.INSURER) {
        throw new ForbiddenException('Недостаточно прав');
      }

      const access = await this.prisma.insuranceAccess.findUnique({
        where: {
          insureeId_insuranceCompanyId: { insureeId, insuranceCompanyId },
        },
        include: {
          insuree: true,
          insuranceCompany: true,
          grantedBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });

      if (!access) throw new NotFoundException('Доступ не найден');
      return access;
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
