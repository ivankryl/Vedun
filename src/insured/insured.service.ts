import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsuredService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.insured.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        inn: true,
        industry: true,
        size: true,
        status: true,
      },
    });
  }
}
