import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ВРЕМЕННО: открытый эндпойнт для создания первого админа и брокеров
  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}
