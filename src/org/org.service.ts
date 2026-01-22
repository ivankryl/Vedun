// src/org/org.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyOrg() {
    // В schema нет Organization, поэтому берём страховую компанию как "org" для MVP
    return this.prisma.insuranceCompany.findFirst();
  }
}
