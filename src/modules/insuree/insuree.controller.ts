// insuree.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { InsureeService } from './insuree.service';
import { CreateInsureeDto, UpdateInsureeDto } from './insuree.dto';
import { UserRole } from '@prisma/client';
import { getUserId, getUserRole } from '@/users/request-user';

@Controller('insurees')
export class InsureeController {
  constructor(private insureeService: InsureeService) {}

  @Post()
  create(@Body() dto: CreateInsureeDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insureeService.create(dto, userId);
  }

  @Get()
  getAll(@Req() req: any) {
    const userId = getUserId(req);
    const userRole = getUserRole<UserRole>(req) as UserRole;
    return this.insureeService.getAll(userId, userRole);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Req() req: any) {
    const userId = getUserId(req);
    const userRole = getUserRole<UserRole>(req) as UserRole;
    return this.insureeService.getById(id, userId, userRole);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsureeDto, @Req() req: any) {
    const userId = getUserId(req);
    return this.insureeService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = getUserId(req);
    await this.insureeService.delete(id, userId);
    return { message: 'Страхователь удален' };
  }
}
