// frontend/src/services/api.ts
import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAccessToken } from '../auth/token';

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    'http://localhost:3000').trim();

const BASE = RAW_BASE.replace(/\/$/, '');
const API_BASE_URL = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({ baseURL: API_BASE_URL });

    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const url = config.url ?? '';
      const path = url.startsWith('/') ? url : `/${url}`;

      const isPublic = path.startsWith('/public/');
      const isNoAuthEndpoint = path === '/auth/login' || path === '/auth/register';

      config.headers = config.headers ?? {};

      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (!isFormData && !(config.headers as any)['Content-Type']) {
        (config.headers as any)['Content-Type'] = 'application/json';
      }

      if (isPublic || isNoAuthEndpoint) {
        delete (config.headers as any).Authorization;
        return config;
      }

      const token = getAccessToken();
      if (token && !(config.headers as any).Authorization) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.api.interceptors.response.use(
      (res: AxiosResponse) => res,
      (err: AxiosError) => {
        if (err.response?.status === 401) clearAccessToken();
        return Promise.reject(err);
      }
    );
  }

  register(email: string, password: string, name: string, role: string, companyName?: string, phone?: string) {
    return this.api.post('/auth/register', { email, password, name, role, companyName, phone });
  }

  login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }

  getMe() {
    return this.api.get('/auth/me');
  }

  getOrgMe() {
    return this.api.get('/org/me');
  }

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

  listSurveyLinksByInsuredId(insuredId: string) {
    return this.api.get(`/insured/${insuredId}/survey-links`);
  }

  createSurveyLinkForInsured(insuredId: string) {
    return this.api.post(`/insured/${insuredId}/survey-links`);
  }

  getPublicSurveyByToken(token: string) {
    return this.api.get(`/public/s/${token}`);
  }

  submitPublicSurveyByToken(token: string, payload: { answers: any; respondentMeta?: any }) {
    return this.api.post(`/public/s/${token}/submit`, payload);
  }

  getPublicSurveyResultsByToken(token: string) {
    return this.api.get(`/public/s/${token}/results`);
  }
}

const api = new ApiService();
export default api;

// ✅ Named exports (чтобы совпали с импортами в страницах)
export const register = api.register.bind(api);
export const login = api.login.bind(api);
export const getMe = api.getMe.bind(api);

export const getOrgMe = api.getOrgMe.bind(api);

export const getInsuredList = api.getInsuredList.bind(api);
export const getInsuredById = api.getInsuredById.bind(api);
export const createInsured = api.createInsured.bind(api);

export const listSurveyLinksByInsuredId = api.listSurveyLinksByInsuredId.bind(api);
export const createSurveyLinkForInsured = api.createSurveyLinkForInsured.bind(api);

export const getPublicSurveyByToken = api.getPublicSurveyByToken.bind(api);
export const submitPublicSurveyByToken = api.submitPublicSurveyByToken.bind(api);
export const getPublicSurveyResultsByToken = api.getPublicSurveyResultsByToken.bind(api);
