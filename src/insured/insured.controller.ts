import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateInsuredDto } from './dto/create-insured.dto';

@Controller('insured')
export class InsuredController {
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('create')
  create(@Body() dto: CreateInsuredDto) {
    return { created: true, dto };
  }
}
