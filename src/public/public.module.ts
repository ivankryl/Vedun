// src/public/public.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SurveyPublicController } from './survey-public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SurveyPublicController],
})
export class PublicModule {}
