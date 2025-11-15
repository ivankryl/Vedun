import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('ping')
  ping() {
    return { ok: true };
  }
}

