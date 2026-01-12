// src/insured/insured.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { InsuredService } from './insured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInsuredDto } from './dto/create-insured.dto';

@UseGuards(JwtAuthGuard)
@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  list(@Req() req: any) {
    const orgId = req.user?.orgId;
    if (!orgId) throw new ForbiddenException('User is not bound to an organization');
    return this.insuredService.listForOrg(orgId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user?.orgId;
    if (!orgId) throw new ForbiddenException('User is not bound to an organization');
    return this.insuredService.getForOrgById(orgId, id);
  }

    @Post()
    create(@Req() req: any, @Body() dto: CreateInsuredDto) {
      const orgId = req.user?.orgId;
      if (!orgId) throw new ForbiddenException('User is not bound to an organization');
      return this.insuredService.createForOrg(orgId, dto);
    }

  @Get(':id/survey-links')
  listSurveyLinks(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user?.orgId;
    if (!orgId) throw new ForbiddenException('User is not bound to an organization');
    return this.insuredService.listSurveyLinksForOrgInsured(orgId, id);
  }
    
  @Post(':id/survey-links')
  createSurveyLink(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user?.orgId;
    if (!orgId) throw new ForbiddenException('User is not bound to an organization');

    // зависит от JWT payload (часто sub = userId)
    const userId = req.user?.sub ?? req.user?.id;

    return this.insuredService.createSurveyForOrgInsured(orgId, id, userId);
  }
}
