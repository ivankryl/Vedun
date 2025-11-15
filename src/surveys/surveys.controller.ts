import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Controller('surveys')
export class SurveysController {
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('create')
  create(@Body() dto: CreateSurveyDto) {
    return { created: true, dto };
  }
}
