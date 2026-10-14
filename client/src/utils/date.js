const pad = n => String(n).padStart(2, '0');
export const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
export const WEEKDAYS = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
export const toYmd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const todayYmd = () => { const d = new Date(); return toYmd(d.getFullYear(), d.getMonth(), d.getDate()); };
export const formatDay = (ymd, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => new Date(ymd + 'T12:00:00').toLocaleDateString('it-IT', opts);
export const rangeDays = (from, to) => { const out = []; for (let d = new Date(from + 'T12:00:00'); d <= new Date(to + 'T12:00:00'); d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10)); return out; };
export const formatRange = (from, to) => from === to ? formatDay(from, { weekday: 'short', day: 'numeric', month: 'short' })
  : `${formatDay(from, { day: 'numeric', month: 'short' })} → ${formatDay(to, { day: 'numeric', month: 'short' })}`;
