//
//  surveys.public.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SurveysPublicService } from './surveys.public.service';
import { SaveSurveyResponseDto, SubmitSurveyResponseDto } from './dto/public-response.dto';

@Controller('survey')
export class SurveysPublicController {
  constructor(private readonly publicService: SurveysPublicService) {}

  @Get(':token')
  getLink(@Param('token') token: string) {
    return this.publicService.getLinkByToken(token);
  }

  @Post(':token/open')
  open(@Param('token') token: string) {
    return this.publicService.open(token);
  }

  @Post(':token/save')
  save(@Param('token') token: string, @Body() dto: SaveSurveyResponseDto) {
    return this.publicService.save(token, dto);
  }

  @Post(':token/submit')
  submit(@Param('token') token: string, @Body() dto: SubmitSurveyResponseDto) {
    return this.publicService.submit(token, dto);
  }

  @Get(':token/current')
  current(@Param('token') token: string) {
    return this.publicService.getCurrent(token);
  }

  @Get(':token/results')
  results(@Param('token') token: string) {
    return this.publicService.getSubmitted(token);
  }
}
