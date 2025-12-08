// src/version/version.controller.ts
import { Controller, Get } from '@nestjs/common';
import * as pkg from '../../package.json';

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    // читаем поле "version" из package.json
    const version = (pkg as any).version ?? '0.0.0';
    return { version };
  }
}
