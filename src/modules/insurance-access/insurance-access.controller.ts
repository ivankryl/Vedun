//  insurance-access.controller.ts
import { Controller, Post, Delete, Get, Param, Body, Req } from '@nestjs/common';
import { InsuranceAccessService } from './insurance-access.service';
import { GrantAccessDto, RevokeAccessDto } from './insurance-access.dto';

@Controller('insurance-access')
export class InsuranceAccessController {
  constructor(private insuranceAccessService: InsuranceAccessService) {}

  @Post('grant')
  async grantAccess(@Body() dto: GrantAccessDto, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceAccessService.grantAccess(dto, brokerId);
  }

  @Delete('revoke')
  async revokeAccess(@Body() dto: RevokeAccessDto, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceAccessService.revokeAccess(dto, brokerId);
  }

  @Get('insuree/:insureeId')
  async getInsurersForInsuree(@Param('insureeId') insureeId: string, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceAccessService.getInsurersForInsuree(insureeId, brokerId);
  }

  @Get('insurer/:insuranceCompanyId')
  async getInsureesForInsurer(@Param('insuranceCompanyId') insuranceCompanyId: string) {
    return this.insuranceAccessService.getInsureesForInsurer(insuranceCompanyId);
  }

  @Get(':insureeId/:insuranceCompanyId')
  async getAccessDetails(
    @Param('insureeId') insureeId: string,
    @Param('insuranceCompanyId') insuranceCompanyId: string,
  ) {
    return this.insuranceAccessService.getAccessDetails(insureeId, insuranceCompanyId);
  }
}
