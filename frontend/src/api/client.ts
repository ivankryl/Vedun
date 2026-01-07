// frontend/src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const API_PREFIX = '/api';

function buildUrl(path: string): string {
  return `${API_BASE}${API_PREFIX}${path}`;
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(buildUrl(path), {
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

  // если где-то будет 204 No Content
  if (res.status === 204) return null;
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
