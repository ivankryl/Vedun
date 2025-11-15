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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    InsuredModule,
    SurveysModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public'), })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

