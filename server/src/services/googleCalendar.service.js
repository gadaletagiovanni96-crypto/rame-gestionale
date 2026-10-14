import fs from 'fs'; import { google } from 'googleapis'; import { env } from '../config/env.js';
const TZ = 'Europe/Rome', pad = n => String(n).padStart(2, '0');
let client = null; // null = non inizializzato, false = disattivato

function getClient() {
  if (client !== null) return client;
  const { calendarId, credentials } = env.google;
  if (!calendarId || !credentials) return (client = false);
  try {
    const raw = credentials.trim().startsWith('{') ? credentials : fs.readFileSync(credentials, 'utf8');
    const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(raw), scopes: ['https://www.googleapis.com/auth/calendar'] });
    client = google.calendar({ version: 'v3', auth });
  } catch (e) { console.error('[GoogleCalendar] configurazione non valida:', e.message); client = false; }
  return client;
}
const plusHour = t => { const [h, m] = t.split(':').map(Number); return h >= 23 ? '23:59' : `${pad(h + 1)}:${pad(m)}`; };
const nextDay = d => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + 1); return x.toISOString().slice(0, 10); };

function toResource(e) {
  const lines = [
    e.leader && `Responsabile: ${e.leader.name}`,
    (e.animators.length || e.guests.length) && `Squadra: ${[...e.animators.map(a => a.name), ...e.guests].join(', ')}`,
    e.materials.length && `Materiale: ${e.materials.map(m => `${m.material?.name} x${m.qty}`).join(', ')}`,
    e.notes && `Note: ${e.notes}`
  ].filter(Boolean);
  const base = { summary: e.title, location: e.location || undefined, description: lines.join('\n') };
  if (!e.start) return { ...base, start: { date: e.date }, end: { date: nextDay(e.date) } };
  const end = e.end && e.end > e.start ? e.end : plusHour(e.start);
  return { ...base, start: { dateTime: `${e.date}T${e.start}:00`, timeZone: TZ }, end: { dateTime: `${e.date}T${end}:00`, timeZone: TZ } };
}

export const googleCalendar = {
  // Non lancia mai: un problema con Google non deve bloccare il gestionale
  async upsert(event) {
    const cal = getClient(); if (!cal) return null;
    const calendarId = env.google.calendarId, requestBody = toResource(event);
    try {
      if (event.googleEventId) {
        try { return (await cal.events.update({ calendarId, eventId: event.googleEventId, requestBody })).data.id; }
        catch (e) { if (![404, 410].includes(e.code)) throw e; }
      }
      return (await cal.events.insert({ calendarId, requestBody })).data.id;
    } catch (e) { console.error('[GoogleCalendar] sync fallita:', e.message); return null; }
  },
  async remove(googleEventId) {
    const cal = getClient(); if (!cal || !googleEventId) return;
    try { await cal.events.delete({ calendarId: env.google.calendarId, eventId: googleEventId }); }
    catch (e) { if (![404, 410].includes(e.code)) console.error('[GoogleCalendar] eliminazione fallita:', e.message); }
  }
};
