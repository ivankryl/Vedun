//  insurance-access.module.ts
import { Module } from '@nestjs/common';
import { InsuranceAccessService } from './insurance-access.service';
import { InsuranceAccessController } from './insurance-access.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InsuranceAccessService],
  controllers: [InsuranceAccessController],
  exports: [InsuranceAccessService],
})
export class InsuranceAccessModule {}
