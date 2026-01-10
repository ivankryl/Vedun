import { Controller, Get, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { InsuredService } from './insured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  list(@Req() req: any) {
    const orgId = req?.user?.orgId;
    if (!orgId) {
      throw new ForbiddenException('User has no organization (orgId is missing)');
    }
    return this.insuredService.listForOrg(orgId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    const orgId = req?.user?.orgId;
    if (!orgId) {
      throw new ForbiddenException('User has no organization (orgId is missing)');
    }
    return this.insuredService.createForOrg(orgId, dto);
  }
}
