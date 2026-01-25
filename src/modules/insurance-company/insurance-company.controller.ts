//
//  insurance-company.controller.ts
import { Controller, Post, Get, Put, Delete, Param, Body, Req } from '@nestjs/common';
import { InsuranceCompanyService } from './insurance-company.service';
import { CreateInsuranceCompanyDto, UpdateInsuranceCompanyDto } from './insurance-company.dto';

@Controller('insurance-companies')
export class InsuranceCompanyController {
  constructor(private insuranceCompanyService: InsuranceCompanyService) {}

  @Post()
  async create(@Body() dto: CreateInsuranceCompanyDto, @Req() req: any) {
    // Временно: пока нет JWT/Role guard, берём brokerId из req (или захардкодьте для локального теста)
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceCompanyService.create(dto, brokerId);
  }

  @Get()
  async getAll(@Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceCompanyService.getAll(brokerId);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceCompanyService.getById(id, brokerId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInsuranceCompanyDto, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    return this.insuranceCompanyService.update(id, dto, brokerId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-broker-id'];
    await this.insuranceCompanyService.delete(id, brokerId);
    return { message: 'Страховая компания удалена' };
  }
}
