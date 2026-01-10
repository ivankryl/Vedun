//  frontend/src/auth/token.ts

const KEY = 'access_token';

export function setAccessToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(KEY);
}

export function isAuthed() {
  return Boolean(getAccessToken());
}
