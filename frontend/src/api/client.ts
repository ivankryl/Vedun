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

// убираем trailing slash, чтобы не получить //api
const API_BASE = RAW_BASE.replace(/\/$/, '');

function buildUrl(path: string): string {
  // гарантируем ведущий /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // собираем URL безопасно (Safari-friendly)
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

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `API ${path} expected JSON but got "${contentType}". Body: ${text.slice(0, 300)}`
    );
  }

  return res.json();
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
