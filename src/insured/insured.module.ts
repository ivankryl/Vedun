// src/insured/insured.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsuredService } from './insured.service';
import { InsuredController } from './insured.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsuredController],
  providers: [PrismaService,InsuredService],
})
export class InsuredModule {}
