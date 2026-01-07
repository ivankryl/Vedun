import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InsuredService } from './insured.service';

type CreateInsuredBody = {
  name?: string;
  inn?: string;
  contactName?: string;
  industryCode?: string; // '01', '02' и т.п.
  sizeCode?: string;     // '1', '2', '3'
};

@Controller('insured')
export class InsuredController {
  constructor(private readonly insuredService: InsuredService) {}

  @Get()
  findAll() {
    return this.insuredService.findAll();
  }
}
