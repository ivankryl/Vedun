import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('create')
  create(@Body() dto: CreateUserDto) {
    // Пока просто возвращаем dto, чтобы увидеть, что валидация прошла
    return { created: true, dto };
  }
}
