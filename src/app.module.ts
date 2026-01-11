// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InsuredModule } from './insured/insured.module';
import { SurveysModule } from './surveys/surveys.module';
import { VersionController } from './version/version.controller';
import { PrismaModule } from './prisma/prisma.module';
import { OrgModule } from './org/org.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,
    InsuredModule,
    SurveysModule,
    OrgModule,
    PublicModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public'), })
  ],
  controllers: [AppController, VersionController],
  providers: [AppService],
})
export class AppModule {}
