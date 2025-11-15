import { Module } from '@nestjs/common';
import { InsuredController } from './insured.controller';
import { InsuredService } from './insured.service';

@Module({
  controllers: [InsuredController],
  providers: [InsuredService]
})
export class InsuredModule {}
