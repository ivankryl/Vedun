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
 * - Если на бэкенде есть глобальный префикс "/api" — оставь API_PREFIX='/api'
 * - Если префикса НЕТ — поставь API_PREFIX='' (пусто)
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

  // Маркер, чтобы проверить что прод обновился (смотри Console)
  console.log('API_FETCH_MARKER_v3', path);

  const timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT ?? 30000);

  const externalSignal = init.signal;
  const timeoutController = new AbortController();

  let signalToUse: AbortSignal;

  if ((AbortSignal as any)?.any) {
    signalToUse = (AbortSignal as any).any([
      timeoutController.signal,
      ...(externalSignal ? [externalSignal] : []),
    ]);
  } else if (externalSignal) {
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

        const isAuthUrl = url.includes('/auth/');
        const isPublicUrl = url.includes('/public/');

        // Content-Type только если отправляем JSON-строку и не задан вручную
        if (typeof init.body === 'string' && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }

        // ГЛАВНОЕ: на auth/public НИКОГДА не шлём Authorization
        if (isAuthUrl || isPublicUrl) {
          delete headers['Authorization'];
          return headers;
        }

        // На остальных — подставляем токен, если он есть и если не передали вручную
        if (!headers['Authorization']) {
          const t = getAccessToken();
          if (t) headers['Authorization'] = `Bearer ${t}`;
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
    return data ?? JSON.parse(text);
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      const err: ApiError = new Error(`API ${path} timed out after ${timeoutMs}ms`);
      err.code = externalSignal?.aborted ? 'ABORTED' : 'TIMEOUT';
      err.url = url;
      err.path = path;
      err.timeoutMs = timeoutMs;
      throw err;
    }

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

// Public (если у тебя реально такие роуты на backend)
export function getPublicSurveyByToken(token: string) {
  return apiFetch(`/public/s/${token}`);
}

export function submitPublicSurveyByToken(
  token: string,
  payload: { answers: any; respondentMeta?: any }
) {
  return apiFetch(`/public/s/${token}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getPublicSurveyResultsByToken(token: string) {
  return apiFetch(`/public/s/${token}/results`);
}
