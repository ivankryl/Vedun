import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
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

  @Post()
  create(@Req() req: any, @Body() dto: CreateInsuredDto) {
    const orgId = req.user?.orgId;
    if (!orgId) throw new ForbiddenException('User is not bound to an organization');
    return this.insuredService.createForOrg(orgId, dto);
  }
}
