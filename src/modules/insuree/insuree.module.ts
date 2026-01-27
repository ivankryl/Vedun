//  insuree.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InsuranceAccessModule } from '../insurance-access/insurance-access.module';
import { InsureeService } from './insuree.service';
import { InsureeController } from './insuree.controller';

@Module({
  imports: [PrismaModule, InsuranceAccessModule],
  providers: [InsureeService],
  controllers: [InsureeController],
  exports: [InsureeService],
})
export class InsureeModule {}

