//  survey.ts
// Типы для опросов

export interface SurveyQuestion {
  id: string;
  text: string;
  category: string;
  type: 'select' | 'radio' | 'checkbox' | 'text';
  options?: Array<{ id: string; label: string; value: any }>;
  required: boolean;
  weight?: number;
}

export interface SurveyTemplate {
  id: string;
  version: string;
  title: string;
  schema: {
    sections: Array<{
      id: string;
      title: string;
      questions: SurveyQuestion[];
    }>;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface SurveyLink {
  id: string;
  uuid: string;
  status: 'CREATED' | 'OPENED' | 'IN_PROGRESS' | 'SAVED' | 'COMPLETED' | 'DEACTIVATED' | 'EXPIRED';
  insuree: {
    id: string;
    name: string;
    companySize: 'SMALL' | 'MEDIUM' | 'LARGE';
  };
  survey: SurveyTemplate;
  createdAt: string;
  openedAt?: string;
  completedAt?: string;
}

export interface SurveyResponse {
  id: string;
  attemptNo: number;
  answers: Record<string, any>;
  completenessPercent?: number;
  respondentMeta?: Record<string, any>;
  status: 'IN_PROGRESS' | 'SAVED' | 'SUBMITTED';
  lastSavedAt?: string;
  submittedAt?: string;
}

export interface SurveyResult {
  id: string;
  uuid: string;
  rating: number;
  band: 'A' | 'B' | 'C' | 'D' | 'E';
  answers: Record<string, any>;
  recommendations: Array<{
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    actions: string[];
  }>;
  submittedAt: string;
}

export interface Insuree {
  id: string;
  name: string;
  taxId: string;
  registrationId?: string;
  companySize: 'SMALL' | 'MEDIUM' | 'LARGE';
  contactName: string;
  contactEmail: string;
  phone?: string;
  createdAt: string;
}
