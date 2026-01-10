//  frontend/src/auth/token.ts

const KEY = 'access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(KEY);
}

export function isAuthed(): boolean {
  return !!getAccessToken();
}
