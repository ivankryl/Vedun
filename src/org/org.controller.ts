// src/org/org.controller.ts
import { Controller, Get } from '@nestjs/common';
import { OrgService } from './org.service';

@Controller('org')          // БЫЛО: 'api/org'
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get('me')
  getMyOrg() {
    return this.orgService.getMyOrg();
  }
}
