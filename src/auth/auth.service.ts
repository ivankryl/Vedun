import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const accessExp = this.config.get<string>('JWT_EXPIRES') ?? '15m';
    const refreshExp = this.config.get<string>('REFRESH_EXPIRES') ?? '7d';

    const payloadAccess = { sub: user.id, role: user.role };
    const payloadRefresh = { sub: user.id, type: 'refresh' as const };

    const accessToken = await this.jwtService.signAsync(payloadAccess, {
      secret,
      expiresIn: accessExp as any,
    });

    const refreshToken = await this.jwtService.signAsync(payloadRefresh, {
      secret,
      expiresIn: refreshExp as any,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }
}
