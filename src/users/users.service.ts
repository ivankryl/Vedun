// src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role, // важно: dto.role должен совпадать со значениями enum UserRole в Prisma
        fullName: dto.fullName,
        insuranceCompanyId: dto.insuranceCompanyId, // ✅ ОБЯЗАТЕЛЬНО по schema.prisma
        companyName: dto.companyName,
        phone: dto.phone,
      },
    });

    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
