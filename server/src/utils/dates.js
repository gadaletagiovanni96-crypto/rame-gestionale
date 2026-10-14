import { ApiError } from './ApiError.js';
export const todayRome = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });   // YYYY-MM-DD
export function daysBetween(from, to) {
  const out = [];
  for (let d = new Date(from + 'T12:00:00Z'); d <= new Date(to + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10)); if (out.length > 366) throw ApiError.badRequest('Intervallo troppo lungo');
  }
  return out;
}
export const isPeriodClosed = p => Boolean(p.deadline) && todayRome() > p.deadline;   // il giorno del termine è ancora utile
export const addDays = (ymd, n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
