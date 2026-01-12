// src/insured/dto/create-insured.dto.ts
import { CompanySize } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInsuredDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  inn: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  headcount?: number | string | null;

  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize | null;

  @IsOptional()
  contacts?: any;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'TEST'])
  status?: 'ACTIVE' | 'INACTIVE' | 'TEST';

  @IsOptional()
  @IsEmail()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactName?: string | null;

  @IsOptional()
  @IsString()
  contactTitle?: string | null;

  @IsOptional()
  @IsString()
  ogrn?: string | null;
}
