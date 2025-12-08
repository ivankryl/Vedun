// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // чтобы UsersService мог использовать PrismaService
  providers: [UsersService],
  exports: [UsersService], // ВАЖНО: экспортируем UsersService
})
export class UsersModule {}
