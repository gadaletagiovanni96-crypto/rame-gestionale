import { Event } from '../models/Event.js'; import { dayStatuses } from './availability.service.js';
import { ApiError } from '../utils/ApiError.js'; import { notificationService as notif } from './notification.service.js'; import { googleCalendar } from './googleCalendar.service.js';
import { MANAGERS } from '../utils/constants.js';

const populated = q => q.populate('animators', 'name').populate('leader', 'name').populate('materials.material');
const sameId = (a, b) => String(a) === String(b);
const has = (list, x) => list.some(o => sameId(o, x));
const crew = e => [...e.animators, e.leader].filter(Boolean);
const DETAIL_FIELDS = ['date', 'start', 'end', 'location'];

// Allinea Google Calendar all'evento corrente (best effort)
async function sync(id) {
  const e = await populated(Event.findById(id)); if (!e) return;
  const gid = await googleCalendar.upsert(e);
  if (gid && gid !== e.googleEventId) await Event.updateOne({ _id: id }, { googleEventId: gid });
}

export const eventService = {
  list({ from, to, mine }, user) {
    const filter = {};
    if (from && to) filter.date = { $gte: from, $lte: to };
    if (mine || !MANAGERS.includes(user.role)) filter.$or = [{ animators: user.id }, { leader: user.id }];
    return populated(Event.find(filter).sort('date start'));
  },

  // Occupazione di una giornata: impegni degli animatori, materiale già usato, disponibilità dichiarate
  async busy(date, exclude) {
    const events = await Event.find({ date, ...(exclude && { _id: { $ne: exclude } }) });
    const animators = {}, materials = {};
    for (const e of events) {
      crew(e).forEach(a => (animators[a] ||= []).push(`${e.title} (${e.start || '?'}-${e.end || '?'})`));
      e.materials.forEach(m => { materials[m.material] = (materials[m.material] || 0) + m.qty; });
    }
    const { availability, notes } = await dayStatuses(date);   // risposte, indisponibilità libere e periodi scaduti senza risposta
    return { animators, materials, availability, notes };
  },

  async create(data) {
    const e = await Event.create(data);
    sync(e.id); return e;
  },

  async update(id, data) {
    const old = await Event.findById(id); if (!old) throw ApiError.notFound('Evento non trovato');
    const changed = DETAIL_FIELDS.some(k => (old[k] || '') !== (data[k] || ''));
    const sig = ms => ms.map(m => `${m.material}:${m.qty}`).sort().join('|');
    const resetMaterial = sig(old.materials) !== sig(data.materials) || old.date !== data.date;   // se cambia il materiale va ricontrollato
    const e = await Event.findByIdAndUpdate(id, { ...data, ...(changed && { acks: [] }), ...(resetMaterial && { materialReady: false }) }, { new: true, runValidators: true });
    if (changed) await notif.notify(crew(e), `Evento modificato: ${e.title} il ${e.date} — conferma di nuovo la presa visione`);
    sync(id); return e;
  },

  async updateTeam(id, { leader, animators, guests }) {
    const old = await Event.findById(id); if (!old) throw ApiError.notFound('Evento non trovato');
    const e = await Event.findByIdAndUpdate(id, { leader: leader || null, animators: animators.filter(a => !sameId(a, leader)), guests }, { new: true });
    const [before, after] = [crew(old), crew(e)];
    e.acks = e.acks.filter(a => has(after, a.user)); await e.save();   // la presa visione resta solo a chi è ancora in squadra
    await Promise.all([
      notif.notify(after.filter(x => !has(before, x)), `Sei stato assegnato a: ${e.title} il ${e.date}`),
      notif.notify(before.filter(x => !has(after, x)), `Sei stato rimosso da: ${e.title} il ${old.date}`)]);
    sync(id); return e;
  },

  async setMaterialReady(id, ready) {
    const e = await Event.findByIdAndUpdate(id, { materialReady: ready }, { new: true });
    if (!e) throw ApiError.notFound('Evento non trovato'); return e;
  },

  async ack(id, userId) {
    const e = await Event.findOne({ _id: id, $or: [{ animators: userId }, { leader: userId }] });
    if (!e) throw ApiError.forbidden('Non fai parte di questo evento');
    if (!e.acks.some(a => sameId(a.user, userId))) { e.acks.push({ user: userId }); await e.save(); }
    return e;
  },

  async remove(id) {
    const e = await Event.findByIdAndDelete(id); if (!e) throw ApiError.notFound('Evento non trovato');
    await notif.notify(crew(e), `Evento annullato: ${e.title} il ${e.date}`);
    googleCalendar.remove(e.googleEventId);
  }
};
