import { Module } from '@nestjs/common';
import { InsuredService } from './insured.service';
import { InsuredController } from './insured.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InsuredController],
  providers: [InsuredService],
})
export class InsuredModule {}
