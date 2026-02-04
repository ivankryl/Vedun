// insurance-access.controller.ts
import { Controller, Post, Delete, Get, Param, Body, Req } from '@nestjs/common';
import { InsuranceAccessService } from './insurance-access.service';
import { GrantAccessDto, RevokeAccessDto } from './insurance-access.dto';
import { getUserId } from '@/users/request-user';

@Controller('insurance-access')
export class InsuranceAccessController {
  constructor(private insuranceAccessService: InsuranceAccessService) {}

  @Post('grant')
  grantAccess(@Body() dto: GrantAccessDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceAccessService.grantAccess(dto, userId);
  }

  @Delete('revoke')
  revokeAccess(@Body() dto: RevokeAccessDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceAccessService.revokeAccess(dto, userId);
  }

  @Get('insuree/:insureeId')
  getInsurersForInsuree(@Param('insureeId') insureeId: string, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceAccessService.getInsurersForInsuree(insureeId, userId);
  }

  // страховщик получает только "свои" доступы (insuranceCompanyId берём из user)
  @Get('insurer/me')
  getInsureesForCurrentInsurer(@Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceAccessService.getInsureesForInsurer(userId);
  }

  @Get(':insureeId/:insuranceCompanyId')
  getAccessDetails(
    @Param('insureeId') insureeId: string,
    @Param('insuranceCompanyId') insuranceCompanyId: string,
    @Req() req: any,
  ) {
    const userId = getUserId(req);
    return this.insuranceAccessService.getAccessDetails(insureeId, insuranceCompanyId, userId);
  }
}
