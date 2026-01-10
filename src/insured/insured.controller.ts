import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { InsuredService } from './insured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  list(@Req() req: any) {
    return this.insuredService.listForOrg(req.user.orgId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.insuredService.createForOrg(req.user.orgId, dto);
  }
}
