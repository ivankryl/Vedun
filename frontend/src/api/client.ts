// frontend/src/api/client.ts
import { getAccessToken } from '../auth/token';

const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_API_URL ??
    '').trim();

if (!RAW_BASE) {
  throw new Error(
    'API base URL is not set. Set VITE_API_BASE_URL (or VITE_API_URL) in Render and redeploy.'
  );
}

const API_BASE = RAW_BASE.replace(/\/$/, '');

/**
 * ВАЖНО:
 * - Если на бэкенде есть глобальный префикс "/api" (часто в NestJS), оставь API_PREFIX='/api'
 * - Если префикса НЕТ (роуты типа /insured, /org/me), поставь API_PREFIX='' (пусто)
 */
const API_PREFIX = '/api';

function buildUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(`${API_PREFIX}${cleanPath}`, API_BASE).toString();
}

type ApiError = Error & {
  status?: number;
  data?: any;
};

async function apiFetch(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);
  const token = getAccessToken();

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text().catch(() => '');
  const contentType = res.headers.get('content-type') ?? '';

  let data: any = null;
  if (text && contentType.includes('application/json')) {
    try {
      data = JSON.parse(text);
    } catch {
      // оставим data=null, ниже сформируем понятную ошибку
    }
  }

  if (!res.ok) {
    const err: ApiError = new Error(
      data?.message
        ? Array.isArray(data.message)
          ? data.message.join('; ')
          : String(data.message)
        : `API ${path} failed: ${res.status} ${text.slice(0, 300)}`
    );
    err.status = res.status;
    err.data = data ?? text;
    throw err;
  }

  if (res.status === 204) return null;
  if (!text.trim()) return null;

  // если это не JSON — вернём как текст (редко, но бывает)
  if (!contentType.includes('application/json')) return text;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `API ${path} expected JSON but got "${contentType}". Body: ${text.slice(0, 300)}`
    );
  }
}

// ------- Auth -------
export function login(payload: { email: string; password: string }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<{ access_token: string }>;
}

// ------- Org -------
export function getOrgMe() {
  return apiFetch('/org/me');
}

// ------- Insured -------
export function getInsuredList() {
  return apiFetch('/insured');
}

/**
 * createInsured: под текущий backend DTO:
 * name, inn обязательны; industry/size опциональны.
 *
 * Если у тебя на форме остались industryCode/sizeCode — маппим их сюда.
 */
export function createInsured(payload: {
  name: string;
  inn: string;
  industry?: string;
  size?: string;

  // совместимость со старым UI/формой (если где-то ещё используется)
  industryCode?: string;
  sizeCode?: string;
}) {
  const body = {
    name: payload.name,
    inn: payload.inn,
    industry: payload.industry ?? payload.industryCode,
    size: payload.size ?? payload.sizeCode,
  };

  return apiFetch('/insured', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
