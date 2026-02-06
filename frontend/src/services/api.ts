// frontend/src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { getAccessToken, clearAccessToken } from '../auth/token';

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    'http://localhost:3000').trim();

const BASE = RAW_BASE.replace(/\/$/, '');

// ВАЖНО: backend доступен по /api, поэтому гарантируем, что baseURL оканчивается на /api
const API_BASE_URL = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
    });

    this.api.interceptors.request.use((config) => {
      const url = config.url ?? '';
      const path = url.startsWith('/') ? url : `/${url}`;

      const isPublic = path.startsWith('/public/');

      // Эндпоинты, где токен НЕ нужен (и даже может мешать)
      const isNoAuthEndpoint =
        path === '/auth/login' ||
        path === '/auth/register';

      config.headers = config.headers ?? {};

      // Content-Type по умолчанию JSON, но FormData не трогаем
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (!isFormData && !(config.headers as any)['Content-Type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }

      // На public и login/register НЕ добавляем Authorization
      if (isPublic || isNoAuthEndpoint) {
        delete (config.headers as any).Authorization;
        return config;
      }

      // На все остальные запросы добавляем Bearer-токен (если есть)
      const token = getAccessToken();
      if (token && !(config.headers as any).Authorization) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.api.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        // Если токен невалиден/истёк — чистим токен
        if (err.response?.status === 401) {
          clearAccessToken();
        }
        return Promise.reject(err);
      }
    );
  }

  // ===== Auth =====

  register(
    email: string,
    password: string,
    name: string,
    role: string,
    companyName?: string,
    phone?: string
  ) {
    return this.api.post('/auth/register', {
      email,
      password,
      name,
      role,
      companyName,
      phone,
    });
  }

  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  // Если у тебя реально есть /auth/me и он требует Bearer — можно оставить.
  // Если нет — удали метод и используй getOrgMe().
  getMe() {
    return this.api.get('/auth/me');
  }

  // ===== Org =====

  getOrgMe() {
    return this.api.get('/org/me');
  }

  // ===== Insured =====

  getInsuredList() {
    return this.api.get('/insured');
  }

  getInsuredById(id: string) {
    return this.api.get(`/insured/${id}`);
  }

  createInsured(payload: {
    name: string;
    inn: string;
    industry?: string;
    headcount?: number | string | null;
    size?: string | null;
    industryCode?: string;
    sizeCode?: string;
  }) {
    const body = {
      name: payload.name,
      inn: payload.inn,
      industry: payload.industry ?? payload.industryCode,
      headcount: payload.headcount ?? null,
      size: payload.size ?? payload.sizeCode ?? null,
    };

    return this.api.post('/insured', body);
  }

  // ===== Surveys (если на backend такие ручки есть) =====

  listSurveysByInsuredId(insuredId: string) {
    return this.api.get(`/insured/${insuredId}/surveys`);
  }

  createSurveyForInsured(insuredId: string) {
    return this.api.post(`/insured/${insuredId}/surveys`);
  }

  listSurveyLinksByInsuredId(insuredId: string) {
    return this.api.get(`/insured/${insuredId}/survey-links`);
  }

  createSurveyLinkForInsured(insuredId: string) {
    return this.api.post(`/insured/${insuredId}/survey-links`);
  }

  // ===== Public =====

  getPublicSurveyByToken(token: string) {
    return this.api.get(`/public/s/${token}`);
  }

  submitPublicSurveyByToken(
    token: string,
    payload: { answers: any; respondentMeta?: any }
  ) {
    return this.api.post(`/public/s/${token}/submit`, payload);
  }

  getPublicSurveyResultsByToken(token: string) {
    return this.api.get(`/public/s/${token}/results`);
  }
}

export default new ApiService();
