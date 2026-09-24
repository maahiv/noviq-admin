const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';
const DB_URL = (import.meta.env.VITE_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');
const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';
const TOKEN_BASE = 'https://securetoken.googleapis.com/v1/token';

const isConfigured = Boolean(API_KEY && DB_URL);

function withAuth(url, token) {
  return token ? `${url}${url.includes('?') ? '&' : '?'}auth=${encodeURIComponent(token)}` : url;
}

export function firebaseConfigured() { return isConfigured; }

export async function signUp(email, password) {
  const res = await fetch(`${AUTH_BASE}:signUp?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Unable to create account');
  return data;
}

export async function signIn(email, password) {
  const res = await fetch(`${AUTH_BASE}:signInWithPassword?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Unable to sign in');
  return data;
}

export async function sendPasswordReset(email) {
  const res = await fetch(`${AUTH_BASE}:sendOobCode?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType: 'PASSWORD_RESET', email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Unable to send reset email');
  return data;
}

export async function refreshIdToken(refreshToken) {
  const res = await fetch(`${TOKEN_BASE}?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }).toString()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Unable to refresh token');
  return data;
}

export async function dbGet(path, token) {
  if (!isConfigured) throw new Error('Firebase is not configured');
  const res = await fetch(withAuth(`${DB_URL}/${path}.json`, token));
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Database read failed');
  return data;
}

export async function dbPost(path, value, token) {
  if (!isConfigured) throw new Error('Firebase is not configured');
  const res = await fetch(withAuth(`${DB_URL}/${path}.json`, token), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Database create failed');
  return data;
}

export async function dbPatch(path, value, token) {
  if (!isConfigured) throw new Error('Firebase is not configured');
  const res = await fetch(withAuth(`${DB_URL}/${path}.json`, token), {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Database update failed');
  return data;
}

export async function dbPut(path, value, token) {
  if (!isConfigured) throw new Error('Firebase is not configured');
  const res = await fetch(withAuth(`${DB_URL}/${path}.json`, token), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Database save failed');
  return data;
}

export async function dbDelete(path, token) {
  if (!isConfigured) throw new Error('Firebase is not configured');
  const res = await fetch(withAuth(`${DB_URL}/${path}.json`, token), { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Database delete failed');
  return data;
}
