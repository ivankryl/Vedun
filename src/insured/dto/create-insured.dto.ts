// src/insured/dto/create-insured.dto.ts
import { CompanySize } from '@prisma/client';

export class CreateInsuredDto {
  name: string;
  inn: string;
  industry?: string;

  // старый способ: численность "цифрами"
  // примеры: 120, "120", "120 сотрудников"
  headcount?: number | string | null;

  // новый строгий способ (если фронт начнёт присылать enum)
  size?: CompanySize | null;

  contacts?: any;
  status?: 'ACTIVE' | 'INACTIVE' | 'TEST';

  contactEmail?: string | null;
  contactName?: string | null;
  contactTitle?: string | null;

  ogrn?: string | null;
}
