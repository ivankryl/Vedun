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
  url?: string;
  path?: string;
  timeoutMs?: number;
  code?: 'TIMEOUT' | 'ABORTED' | 'HTTP_ERROR' | 'NETWORK_ERROR' | 'BAD_JSON';
};



async function apiFetch(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);
  const token = getAccessToken();

  const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT ?? 30000);

  // Позволяем вызывающему коду передать свой signal (например, при размонтировании компонента).
  const externalSignal = init.signal;

  // Внутренний контроллер для таймаута
  const timeoutController = new AbortController();

  // "Склеиваем" сигналы: отмена будет либо по таймауту, либо по внешнему signal
  const controller =
    typeof AbortSignal !== 'undefined' && 'any' in AbortSignal
      ? // AbortSignal.any поддерживается не везде, но где есть — идеально
        new AbortController()
      : null;

  let signalToUse: AbortSignal;

  if (controller && (AbortSignal as any).any) {
    signalToUse = (AbortSignal as any).any([
      timeoutController.signal,
      ...(externalSignal ? [externalSignal] : []),
    ]);
  } else if (externalSignal) {
    // Фолбэк: если внешняя отмена придёт — вручную абортим таймаут-контроллер,
    // и используем его signal (будет прерывание fetch).
    const onAbort = () => timeoutController.abort();
    if (externalSignal.aborted) timeoutController.abort();
    else externalSignal.addEventListener('abort', onAbort, { once: true });

    signalToUse = timeoutController.signal;
  } else {
    signalToUse = timeoutController.signal;
  }

  const timeoutId = window.setTimeout(() => {
    timeoutController.abort();
  }, timeoutMs);

  try {
      const res = await fetch(url, {
        ...init,
        signal: signalToUse,
        headers: (() => {
          const headers: Record<string, string> = {
            ...(init.headers as any),
          };

          // Content-Type ставим только если это JSON-строка
          if (typeof init.body === 'string' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }

          const isAuthEndpoint =
            path === '/auth/login' || path.startsWith('/auth/');

          const isPublicEndpoint =
            path.startsWith('/public/'); // опционально, но логично

          if (!isAuthEndpoint && !isPublicEndpoint) {
            const token = getAccessToken();
            if (token && !headers['Authorization']) {
              headers['Authorization'] = `Bearer ${token}`;
            }
          }

          return headers;
        })(),
      });


    const text = await res.text().catch(() => '');
    const contentType = res.headers.get('content-type') ?? '';

    let data: any = null;
    if (text && contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        // JSON битый или не JSON при application/json
        const err: ApiError = new Error(
          `API ${path} returned invalid JSON. Body: ${text.slice(0, 300)}`
        );
        err.code = 'BAD_JSON';
        err.url = url;
        err.path = path;
        err.status = res.status;
        err.data = text;
        throw err;
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
      err.code = 'HTTP_ERROR';
      err.status = res.status;
      err.data = data ?? text;
      err.url = url;
      err.path = path;
      throw err;
    }

    if (res.status === 204) return null;
    if (!text.trim()) return null;

    if (!contentType.includes('application/json')) return text;

    // здесь JSON уже либо распарсили в data, либо текста нет
    return data ?? JSON.parse(text);
  } catch (e: any) {
    // fetch кидает TypeError на сетевые ошибки и DOMException AbortError на аборт
    if (e?.name === 'AbortError') {
      const err: ApiError = new Error(`API ${path} timed out after ${timeoutMs}ms`);
      err.code = externalSignal?.aborted ? 'ABORTED' : 'TIMEOUT';
      err.url = url;
      err.path = path;
      err.timeoutMs = timeoutMs;
      throw err;
    }

    // Если это уже наш ApiError — просто пробрасываем
    if (e?.status || e?.code) throw e;

    const err: ApiError = new Error(e?.message || `API ${path} network error`);
    err.code = 'NETWORK_ERROR';
    err.url = url;
    err.path = path;
    err.data = e;
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
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

export function getInsuredById(id: string) {
  return apiFetch(`/insured/${id}`);
}

export function listSurveysByInsuredId(insuredId: string) {
  return apiFetch(`/insured/${insuredId}/surveys`);
}

export function createSurveyForInsured(insuredId: string) {
  return apiFetch(`/insured/${insuredId}/surveys`, { method: 'POST' });
}
export function listSurveyLinksByInsuredId(insuredId: string) {
  return apiFetch(`/insured/${insuredId}/survey-links`);
}

export function createSurveyLinkForInsured(insuredId: string) {
  return apiFetch(`/insured/${insuredId}/survey-links`, { method: 'POST' });
}

export function getPublicSurveyByToken(token: string) {
  return apiFetch(`/public/s/${token}`);
}

export function submitPublicSurveyByToken(token: string, payload: { answers: any; respondentMeta?: any }) {
  return apiFetch(`/public/s/${token}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getPublicSurveyResultsByToken(token: string) {
  return apiFetch(`/public/s/${token}/results`);
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

  headcount?: number | string | null; // ✅ добавили

  size?: string; // оставим на будущее (если сделаешь dropdown SMALL/MEDIUM/LARGE)

  industryCode?: string;
  sizeCode?: string;
}) {
  const body = {
    name: payload.name,
    inn: payload.inn,
    industry: payload.industry ?? payload.industryCode,

    // ✅ главное: шлём headcount
    headcount: payload.headcount ?? null,

    // если когда-то начнёшь слать enum — можно оставить
    size: payload.size ?? payload.sizeCode ?? null,
  };

  return apiFetch('/insured', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

