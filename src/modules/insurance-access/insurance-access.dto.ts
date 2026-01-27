//  insurance-access.dto.ts
import { IsString } from 'class-validator';

export class GrantAccessDto {
  @IsString()
  insureeId: string;

  @IsString()
  insuranceCompanyId: string;
}

export class RevokeAccessDto {
  @IsString()
  insureeId: string;

  @IsString()
  insuranceCompanyId: string;
}

export class InsuranceAccessResponseDto {
  id: string;
  insureeId: string;
  insuranceCompanyId: string;
  grantedAt: Date;
  revokedAt: Date | null;
  grantedById: string;
}

export class AccessCheckResponseDto {
  hasAccess: boolean;
  grantedAt?: Date;
}
