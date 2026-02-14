// frontend/src/services/api.ts
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
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

      const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

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

  // ---- helpers ----
  private async get<T>(url: string, config?: any): Promise<T> {
    const res = await this.api.get<T>(url, config);
    return res.data;
  }

  private async post<T>(url: string, body?: any, config?: any): Promise<T> {
    const res = await this.api.post<T>(url, body, config);
    return res.data;
  }

  // ---- auth ----
  register(
    email: string,
    password: string,
    fullName: string,
    role: string,
    companyName?: string,
    phone?: string
  ) {
    return this.post<{ token?: string; accessToken?: string; user?: any }>(
      '/auth/register',
      { email, password, fullName, role, companyName, phone }
    );
  }

  login(email: string, password: string) {
    return this.post<{ token?: string; accessToken?: string; user?: any }>(
      '/auth/login',
      { email, password }
    );
  }

  getMe() {
    return this.get<any>('/auth/me');
  }

  // ---- org / insured ----
  getOrgMe() {
    return this.get<any>('/org/me');
  }

  getInsuredList() {
    return this.get<any[]>('/insured');
  }

  getInsuredById(id: string) {
    return this.get<any>(`/insured/${id}`);
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
    return this.post<any>('/insured', body);
  }

  // ---- survey links ----
  listSurveyLinksByInsuredId(insuredId: string) {
    return this.get<any[]>(`/insured/${insuredId}/survey-links`);
  }

  createSurveyLinkForInsured(insuredId: string) {
    return this.post<any>(`/insured/${insuredId}/survey-links`);
  }

  // ---- public survey by token ----
  getPublicSurveyByToken(token: string) {
    return this.get<any>(`/survey/${token}`);
  }

  submitPublicSurveyByToken(token: string, payload: { answers: any; respondentMeta?: any }) {
    return this.post<any>(`/survey/${token}/submit`, payload);
  }

  getPublicSurveyResultsByToken(token: string) {
    return this.get<any>(`/survey/${token}/results`);
  }

  // ---------------------------------------------------------------------------
  // Compatibility methods for existing components (SurveyForm/SurveyResults)
  // If your components call these names, they will still work.
  // These are mapped to the public token endpoints you already have.
  // ---------------------------------------------------------------------------

  /** old name in UI: getSurveyLink(token) */
  getSurveyLink(token: string) {
    return this.getPublicSurveyByToken(token);
  }

  /** old name in UI: openSurvey(token) */
  openSurvey(token: string) {
    return this.getPublicSurveyByToken(token);
  }

  /** old name in UI: submitSurveyResponse(token, payload) */
  submitSurveyResponse(token: string, payload: { answers: any; respondentMeta?: any }) {
    return this.submitPublicSurveyByToken(token, payload);
  }

  /** old name in UI: getSurveyResults(token) */
  getSurveyResults(token: string) {
    return this.getPublicSurveyResultsByToken(token);
  }

  /**
   * old names in UI: getCurrentResponse/saveSurveyResponse
   * If you don't have drafts on backend, keep them as stubs or remove calls in UI.
   */
  getCurrentResponse(_token: string) {
    return Promise.resolve(null as any);
  }

  saveSurveyResponse(_token: string, _payload: any) {
    return Promise.resolve(null as any);
  }
}

const api = new ApiService();
export default api;

// ✅ Named exports (match imports in pages/components)
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

// compatibility exports (if used directly)
export const getSurveyLink = api.getSurveyLink.bind(api);
export const openSurvey = api.openSurvey.bind(api);
export const submitSurveyResponse = api.submitSurveyResponse.bind(api);
export const getSurveyResults = api.getSurveyResults.bind(api);
export const getCurrentResponse = api.getCurrentResponse.bind(api);
export const saveSurveyResponse = api.saveSurveyResponse.bind(api);
