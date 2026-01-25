//  insurance-company.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateInsuranceCompanyDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  taxId?: string; // ИНН

  @IsString()
  @IsOptional()
  registrationId?: string; // ОГРН
}

export class UpdateInsuranceCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  registrationId?: string;
}

export class InsuranceCompanyResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  taxId?: string;
  registrationId?: string;
  createdAt: Date;
  updatedAt: Date;
}
