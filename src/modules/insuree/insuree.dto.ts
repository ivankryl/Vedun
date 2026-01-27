//  insuree.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { CompanySize } from '@prisma/client';

export class CreateInsureeDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^\d{10,12}$/, { message: 'ИНН должен быть 10-12 цифр' })
  taxId: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{13}$/, { message: 'ОГРН должен быть 13 цифр' })
  registrationId?: string;

  @IsString()
  countryCode: string; // например "RU"

  @IsEnum(CompanySize)
  companySize: CompanySize;

  @IsString()
  contactName: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsOptional()
  contactPosition?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateInsureeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsEnum(CompanySize)
  @IsOptional()
  companySize?: CompanySize;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPosition?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  // Опционально: можно разрешить обновлять эти поля тоже
  @IsOptional()
  industry?: any;

  @IsOptional()
  headcount?: any;

  @IsOptional()
  contacts?: any;

  @IsOptional()
  domainInfo?: any;
}
