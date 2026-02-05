//  frontend/src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import { getAccessToken, clearAccessToken } from '../auth/token';

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

const BASE = RAW_BASE.replace(/\/$/, '');
const API_BASE_URL = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

      this.api.interceptors.request.use((config) => {
        const url = config.url ?? '';

        // url может быть '/auth/login' или 'auth/login' — нормализуем
        const path = url.startsWith('/') ? url : `/${url}`;

        const isAuth = path.startsWith('/auth/');
        const isPublic = path.startsWith('/public/');

        if (isAuth || isPublic) {
          // гарантированно убираем токен
          if (config.headers) delete (config.headers as any).Authorization;
          return config;
        }

        const token = getAccessToken();
        if (token) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }

        return config;
      });


    this.api.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        if (err.response?.status === 401) {
          clearAccessToken();
        }
        return Promise.reject(err);
      },
    );
  }

  // Surveys (проверь, что пути совпадают с backend!)
  getSurveyLink(uuid: string) {
    return this.api.get(`/surveys/${uuid}`);
  }
  openSurvey(uuid: string) {
    return this.api.post(`/surveys/${uuid}/open`);
  }
  getCurrentResponse(uuid: string) {
    return this.api.get(`/surveys/${uuid}/current`);
  }
  saveSurveyResponse(uuid: string, answers: Record<string, any>, completenessPercent: number) {
    return this.api.post(`/surveys/${uuid}/save`, { answers, completenessPercent });
  }
  submitSurveyResponse(uuid: string, answers: Record<string, any>) {
    return this.api.post(`/surveys/${uuid}/submit`, { answers });
  }
  getSurveyResults(uuid: string) {
    return this.api.get(`/surveys/${uuid}/results`);
  }

  // Insurees
  getInsuree(id: string) {
    return this.api.get(`/insurees/${id}`);
  }
  getInsurees() {
    return this.api.get(`/insurees`);
  }
}

export default new ApiService();
