// insurance-company.controller.ts
import { Controller, Post, Get, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { InsuranceCompanyService } from './insurance-company.service';
import { CreateInsuranceCompanyDto, UpdateInsuranceCompanyDto } from './insurance-company.dto';
import { getUserId } from '@/users/request-user';

@Controller('insurance-companies')
export class InsuranceCompanyController {
  constructor(private insuranceCompanyService: InsuranceCompanyService) {}

  @Post()
  create(@Body() dto: CreateInsuranceCompanyDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceCompanyService.create(dto, userId);
  }

  @Get()
  getAll(@Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceCompanyService.getAll(userId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceCompanyService.getById(id, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsuranceCompanyDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insuranceCompanyService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = getUserId(req);
    await this.insuranceCompanyService.delete(id, userId);
    return { message: 'Страховая компания удалена' };
  }
}
