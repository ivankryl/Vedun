//  insuree.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { InsureeService } from './insuree.service';
import { CreateInsureeDto, UpdateInsureeDto } from './insuree.dto';
import { UserRole } from '@prisma/client';

@Controller('insurees')
export class InsureeController {
  constructor(private insureeService: InsureeService) {}

  @Post()
  async create(@Body() dto: CreateInsureeDto, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-user-id'];
    return this.insureeService.create(dto, brokerId);
  }

  @Get()
  async getAll(@Req() req: any) {
    const userId = req?.user?.id ?? req?.headers?.['x-user-id'];
    const userRole = (req?.user?.role ?? req?.headers?.['x-user-role']) as UserRole;
    return this.insureeService.getAll(userId, userRole);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id ?? req?.headers?.['x-user-id'];
    const userRole = (req?.user?.role ?? req?.headers?.['x-user-role']) as UserRole;
    return this.insureeService.getById(id, userId, userRole);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInsureeDto, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-user-id'];
    return this.insureeService.update(id, dto, brokerId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const brokerId = req?.user?.id ?? req?.headers?.['x-user-id'];
    await this.insureeService.delete(id, brokerId);
    return { message: 'Страхователь удален' };
  }
}
