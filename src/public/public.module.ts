// src/public/public.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicBasicController } from './public.controller';
import { SurveyPublicController } from './survey-public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PublicBasicController, SurveyPublicController],
})
export class PublicModule {}
