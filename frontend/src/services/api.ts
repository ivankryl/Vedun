//  api.ts
import axios, { AxiosInstance } from 'axios';

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

// чтобы не было двойных слешей
const API_BASE_URL = RAW_BASE.replace(/\/$/, '') + '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
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
