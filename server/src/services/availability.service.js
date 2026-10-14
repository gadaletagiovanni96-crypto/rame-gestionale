import { Availability } from '../models/Availability.js'; import { Unavailability } from '../models/Unavailability.js'; import { Period } from '../models/Period.js'; import { User } from '../models/User.js';
import { AVAILABILITY } from '../utils/constants.js'; import { daysBetween, isPeriodClosed, addDays } from '../utils/dates.js'; import { notificationService as notif } from './notification.service.js';
const { YES, NO } = AVAILABILITY, same = (a, b) => String(a) === String(b), keyOf = (u, d) => `${u}|${d}`;

/* Stato effettivo di una persona in un giorno (unica fonte per calendario e composizione squadre):
   1. risposta esplicita (in un periodo): "indisponibile" prevale su "disponibile"
   2. indisponibilità libera (giorno/periodo inserito dalla persona)
   3. periodo scaduto senza risposta  → vale come INDISPONIBILE
   4. altrimenti nessuna informazione: periodo aperto (attesa) oppure nessun periodo (chiedere direttamente) */
export async function loadContext(from, to) {
  const [periods, rows, unavs] = await Promise.all([
    Period.find({ from: { $lte: to }, to: { $gte: from } }), Availability.find({ date: { $gte: from, $lte: to } }), Unavailability.find({ from: { $lte: to }, to: { $gte: from } })]);
  const rowsBy = new Map(); for (const r of rows) { const k = keyOf(r.user, r.date); if (!rowsBy.has(k)) rowsBy.set(k, []); rowsBy.get(k).push(r); }
  return { periods, rowsBy, unavs };
}
export function statusOf(ctx, userId, date) {
  const rows = ctx.rowsBy.get(keyOf(userId, date)) || [];
  const no = rows.find(r => r.status === NO); if (no) return { s: NO, r: no.reason || '', k: 'risposta' };
  if (rows.some(r => r.status === YES)) return { s: YES, k: 'risposta' };
  const un = ctx.unavs.find(u => same(u.user, userId) && u.from <= date && u.to >= date); if (un) return { s: NO, r: un.reason || '', k: 'libera' };
  const covering = ctx.periods.filter(p => p.from <= date && p.to >= date);
  if (covering.some(isPeriodClosed)) return { s: NO, r: 'Nessuna risposta entro il termine', k: 'scaduto' };
  return { s: 'nessuna', k: covering.length ? 'attesa' : 'nessuna' };
}

// Per la composizione delle squadre: solo chi ha un'informazione (le altre persone restano "da chiedere")
export async function dayStatuses(date) {
  const [ctx, users] = await Promise.all([loadContext(date, date), User.find({}, '_id')]);
  const availability = {}, notes = {};
  for (const u of users) { const st = statusOf(ctx, u.id, date); if (st.s === 'nessuna') continue; availability[u.id] = st.s; if (st.s === NO && st.r) notes[u.id] = st.r; }
  return { availability, notes };
}

// Calendario di tutti (responsabili e titolare): per ogni giorno lo stato di ogni persona
export async function calendar({ from, to }) {
  const dates = daysBetween(from, to);
  const [ctx, users] = await Promise.all([loadContext(from, to), User.find({}, 'name role').sort('name')]);
  const days = {}; for (const d of dates) { days[d] = {}; for (const u of users) days[d][u.id] = statusOf(ctx, u.id, d); }
  return { users: users.map(u => ({ _id: u.id, name: u.name, role: u.role })), days };
}

// Toglie un giorno da un'indisponibilità libera (accorcia o divide l'intervallo)
async function trimUnavailability(userId, date) {
  for (const d of await Unavailability.find({ user: userId, from: { $lte: date }, to: { $gte: date } })) {
    if (d.from === date && d.to === date) { await Availability.deleteMany({ unavailability: d._id }); await d.deleteOne(); }
    else if (d.from === date) { d.from = addDays(date, 1); await d.save(); }
    else if (d.to === date) { d.to = addDays(date, -1); await d.save(); }
    else {
      const tail = await Unavailability.create({ user: d.user, from: addDays(date, 1), to: d.to, reason: d.reason });
      d.to = addDays(date, -1); await d.save();
      await Availability.updateMany({ unavailability: d._id, date: { $gte: tail.from } }, { $set: { unavailability: tail._id } });
    }
  }
}

// Solo titolare: toglie la risposta di un giorno oppure fa passare un'indisponibilità a disponibilità (sempre, anche a termine scaduto)
export async function setDay({ user: userId, date, status }) {
  if (status === YES) {
    const periods = await Period.find({ from: { $lte: date }, to: { $gte: date } });
    await Availability.bulkWrite((periods.length ? periods.map(p => p._id) : [null]).map(period => ({
      updateOne: { filter: { period, user: userId, date }, update: { $set: { status: YES, reason: '' }, $unset: { unavailability: '' } }, upsert: true } })));
  } else await Availability.deleteMany({ user: userId, date });
  await trimUnavailability(userId, date);
  await notif.notify([userId], `Il titolare ha ${status ? 'modificato' : 'rimosso'} la tua risposta per il ${date}`);
}
