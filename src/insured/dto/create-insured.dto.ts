// src/insured/dto/create-insured.dto.ts
import { CompanySize, InsureeStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInsuredDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Prisma: taxId (обязателен, unique)
  @IsString()
  @IsNotEmpty()
  taxId: string;

  // Prisma: registrationId (optional, unique)
  @IsOptional()
  @IsString()
  registrationId?: string;

  // Prisma: ISO-3166-1 alpha-2 (например "RU")
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsEnum(CompanySize)
  companySize: CompanySize;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  headcount?: number;

  @IsOptional()
  @IsObject()
  contacts?: Record<string, any>;

  @IsOptional()
  @IsEnum(InsureeStatus)
  status?: InsureeStatus;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  contactPosition?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  domainInfo?: any; // Json
}
