// src/surveys/surveys.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';

@Module({
  imports: [PrismaModule],
  controllers: [SurveysController],
  providers: [SurveysService],
})
export class SurveysModule {}

