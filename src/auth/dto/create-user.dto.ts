// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  INSURER = 'INSURER',
  BROKER = 'BROKER',
  ANALYST = 'ANALYST',
  CLIENT = 'CLIENT',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
