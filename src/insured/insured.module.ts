// src/insured/insured.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InsuredService } from './insured.service';
import { InsuredController } from './insured.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InsuredController],
  providers: [InsuredService],
})
export class InsuredModule {}
