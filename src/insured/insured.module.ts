// src/insured/insured.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InsuredService } from './insured.service';
import { InsuredController } from './insured.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InsuredController],
  providers: [InsuredService],
})
export class InsuredModule {}
