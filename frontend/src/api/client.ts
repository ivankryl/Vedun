// frontend/src/api/client.ts

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

function buildUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(`/api${cleanPath}`, API_BASE).toString();
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers ?? {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }

  if (res.status === 204) return null;

  // читаем тело всегда как текст, чтобы корректно обработать пустой ответ
  const text = await res.text().catch(() => '');
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    const contentType = res.headers.get('content-type') ?? '';
    throw new Error(
      `API ${path} expected JSON but got "${contentType}". Body: ${text.slice(0, 300)}`
    );
  }
}

export function getOrgMe() {
  return apiFetch('/org/me');
}

export function getInsuredList() {
  return apiFetch('/insured');
}

export function createInsured(payload: {
  name?: string;
  inn?: string;
  contactName?: string;
  industryCode?: string;
  sizeCode?: string;
}) {
  return apiFetch('/insured', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
