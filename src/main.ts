// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    //  app.enableCors();
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'https://vedun-f.onrender.com',
        ],
        credentials: true,
    });
    
    app.setGlobalPrefix('api', { exclude: [''] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    const config = app.get(ConfigService);
    
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`API listening on port ${port}`);

    // eslint-disable-next-line no-console
    //console.log(`API listening on port ${port}`,'JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    process.on('unhandledRejection', (reason) => {
      console.error('UNHANDLED REJECTION:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION:', err);
    });
    
}
bootstrap();


