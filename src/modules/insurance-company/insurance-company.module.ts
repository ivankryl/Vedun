//
//  insurance-company.module.ts
import { Module } from '@nestjs/common';
import { InsuranceCompanyService } from './insurance-company.service';
import { InsuranceCompanyController } from './insurance-company.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InsuranceCompanyService],
  controllers: [InsuranceCompanyController],
  exports: [InsuranceCompanyService],
})
export class InsuranceCompanyModule {}
