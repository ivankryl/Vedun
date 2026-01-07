// frontend/src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const API_PREFIX = '/api';

function buildUrl(path: string): string {
  return `${API_BASE}${API_PREFIX}${path}`;
}

export async function getOrgMe() {
  const res = await fetch(buildUrl('/org/me'));
  if (!res.ok) {
    throw new Error(`Failed to fetch org/me: ${res.status}`);
  }
  return res.json();
}

export async function getInsuredList() {
  const res = await fetch(buildUrl('/insured'));
  if (!res.ok) {
    throw new Error(`Failed to fetch insured: ${res.status}`);
  }
  return res.json();
}

export async function createInsured(payload: {
  name?: string;
  inn?: string;
  contactName?: string;
  industryCode?: string;
  sizeCode?: string;
}) {
  const res = await fetch(buildUrl('/insured'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create insured: ${res.status}`);
  }
  return res.json();
}

