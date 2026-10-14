const TOKEN_KEY = 'token';

export const tokenStore = { get: () => localStorage.getItem(TOKEN_KEY), set: t => localStorage.setItem(TOKEN_KEY, t), clear: () => localStorage.removeItem(TOKEN_KEY) };
let onUnauthorized = () => {};
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

export async function http(path, { method = 'GET', body, params } = {}) {
  const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')) : '';
  const res = await fetch(`/api${path}${qs}`, {
    method, body: body && JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...(tokenStore.get() && { Authorization: `Bearer ${tokenStore.get()}` }) }
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && tokenStore.get()) onUnauthorized();
  if (!res.ok) throw new Error(data.error || 'Errore di comunicazione con il server');
  return data;
}
