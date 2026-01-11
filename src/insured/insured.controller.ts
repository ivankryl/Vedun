import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { InsuredService } from './insured.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  list(@Req() req: any) {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new ForbiddenException('User is not bound to an organization');
    }

    return this.insuredService.listForOrg(orgId);
  }
}
