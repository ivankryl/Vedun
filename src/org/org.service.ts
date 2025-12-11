import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyOrg() {
    // MVP: просто берём первую активную организацию.
    // Позже заменим на "организация текущего пользователя" по JWT.
    return this.prisma.organization.findFirst({
      where: { status: 'ACTIVE' },
    });
  }
}
