import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InsuredService } from './insured.service';

@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  findAll() {
    return this.insuredService.findAll();
  }
}
