//  src/auth/jwt-auth.guard.ts
//
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Токен не найден');

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Нормализуем user, чтобы везде был user.id
      request.user = {
        ...payload,
        id: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Невалидный токен');
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return undefined;

    return token;
  }
}
