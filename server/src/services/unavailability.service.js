import { Unavailability } from '../models/Unavailability.js'; import { Availability } from '../models/Availability.js'; import { Period } from '../models/Period.js';
import { Event } from '../models/Event.js'; import { User } from '../models/User.js'; import { ApiError } from '../utils/ApiError.js';
import { ROLES, MANAGERS, AVAILABILITY } from '../utils/constants.js'; import { notificationService as notif } from './notification.service.js';
import { todayRome, daysBetween, isPeriodClosed } from '../utils/dates.js';

const overlap = (aFrom, aTo, bFrom, bTo) => { const from = aFrom > bFrom ? aFrom : bFrom, to = aTo < bTo ? aTo : bTo; return from <= to ? daysBetween(from, to) : []; };

// Riporta l'indisponibilità libera nei periodi che coprono quei giorni, così compare anche nelle viste per periodo.
// Non tocca le risposte già date in un periodo scaduto.
export async function mirrorUnavailability(doc, periods) {
  const ops = [];
  for (const p of periods) {
    const days = overlap(doc.from, doc.to, p.from, p.to); if (!days.length) continue;
    const answered = new Set((await Availability.find({ period: p._id, user: doc.user, date: { $in: days } })).map(r => r.date));
    for (const date of days) {
      if (isPeriodClosed(p) && answered.has(date)) continue;
      ops.push({ updateOne: { filter: { period: p._id, user: doc.user, date }, update: { $set: { status: AVAILABILITY.NO, reason: doc.reason || '', unavailability: doc._id } }, upsert: true } });
    }
  }
  if (ops.length) await Availability.bulkWrite(ops);
}

export const unavailabilityService = {
  // Solo quelle in corso o future. Responsabili e titolare possono vedere quelle di tutti.
  list({ all }, user) {
    const filter = { to: { $gte: todayRome() } }; if (!(all && MANAGERS.includes(user.role))) filter.user = user.id;
    return Unavailability.find(filter).populate('user', 'name').sort('from');
  },

  async create(data, userId) {
    const dates = daysBetween(data.from, data.to);
    const periods = await Period.find({ from: { $lte: data.to }, to: { $gte: data.from } });
    // Disponibilità già confermata in un periodo scaduto: non si può più cambiare
    const mine = await Availability.find({ user: userId, period: { $in: periods.map(p => p._id) }, date: { $in: dates } });
    const frozen = mine.filter(r => r.status === AVAILABILITY.YES && isPeriodClosed(periods.find(p => String(p._id) === String(r.period))));
    if (frozen.length) throw ApiError.forbidden(`Non puoi segnarti indisponibile il ${[...new Set(frozen.map(r => r.date))].sort().join(', ')}: hai già confermato la disponibilità e il termine è scaduto. Contatta il titolare.`);

    const doc = await Unavailability.create({ ...data, user: userId });
    await mirrorUnavailability(doc, periods);

    const clashes = await Event.find({ date: { $gte: data.from, $lte: data.to }, $or: [{ animators: userId }, { leader: userId }] });
    if (clashes.length) {
      const [me, managers] = await Promise.all([User.findById(userId), User.find({ role: { $in: MANAGERS } })]);
      await notif.notify(managers.map(m => m.id), `${me.name} ha segnato un'indisponibilità ma è assegnato a: ${clashes.map(e => `${e.title} (${e.date})`).join(', ')}`);
    }
    return doc;
  },

  // Eliminandola, i giorni tornano "senza risposta" (in un periodo scaduto valgono comunque come indisponibili)
  async remove(id, user) {
    const doc = await Unavailability.findById(id); if (!doc) throw ApiError.notFound();
    if (String(doc.user) !== user.id && user.role !== ROLES.OWNER) throw ApiError.forbidden();
    await Availability.deleteMany({ unavailability: doc._id }); await doc.deleteOne();
  }
};
