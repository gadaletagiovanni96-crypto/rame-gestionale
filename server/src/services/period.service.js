import { Period } from '../models/Period.js'; import { Availability } from '../models/Availability.js'; import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js'; import { notificationService as notif } from './notification.service.js';
import { ROLES, MANAGERS, AVAILABILITY } from '../utils/constants.js'; import { Unavailability } from '../models/Unavailability.js'; import { mirrorUnavailability } from './unavailability.service.js'; import { daysBetween, isPeriodClosed } from '../utils/dates.js';

const isClosed = isPeriodClosed;

export const periodService = {
  async list() { return (await Period.find().sort('-from')).map(p => ({ ...p.toObject(), closed: isClosed(p) })); },

  async create(data) {
    const p = await Period.create(data);
    for (const u of await Unavailability.find({ from: { $lte: p.to }, to: { $gte: p.from } })) await mirrorUnavailability(u, [p]);   // chi era già indisponibile risulta tale anche qui
    await notif.notify((await User.find()).map(u => u.id), `Nuovo periodo disponibilità: ${p.title} (${p.from} → ${p.to}). Rispondi entro il ${p.deadline}`);
    return p;
  },

  async setDeadline(id, deadline, user) {
    const p = await Period.findById(id); if (!p) throw ApiError.notFound();
    if (isClosed(p) && user.role !== ROLES.OWNER) throw ApiError.forbidden('Il termine è scaduto: solo il titolare può modificarlo');
    p.deadline = deadline; await p.save(); return p;
  },

  async remove(id, user) {
    const p = await Period.findById(id); if (!p) throw ApiError.notFound();
    if (isClosed(p) && user.role !== ROLES.OWNER) throw ApiError.forbidden('Un periodo scaduto può essere eliminato solo dal titolare');
    await p.deleteOne(); await Availability.deleteMany({ period: id });
  },

  // Gli animatori vedono solo le proprie risposte; responsabili e titolare quelle di tutti
  listAvailability({ period, all }, user) {
    const filter = { period }; if (!(all && MANAGERS.includes(user.role))) filter.user = user.id;
    return Availability.find(filter).populate('user', 'name');
  },

  /* Regole:
     - prima del termine: ognuno modifica liberamente le proprie risposte (disponibile / indisponibile / nessuna)
     - dopo il termine: le disponibilità già confermate sono congelate; le indisponibilità (anche quelle per mancata risposta) si possono sempre cambiare in disponibilità
     - il titolare può modificare/togliere le risposte di un altro account anche dopo il termine */
  async setAvailability({ period, from, to, status, reason, user: targetId }, actor) {
    const p = await Period.findById(period); if (!p) throw ApiError.notFound('Periodo non trovato');
    const dates = daysBetween(from, to || from);
    if (dates.some(d => d < p.from || d > p.to)) throw ApiError.badRequest('Le date devono essere dentro il periodo');
    const target = targetId && actor.role === ROLES.OWNER ? targetId : actor.id;
    const override = target !== actor.id;
    if (!override && isClosed(p) && status !== AVAILABILITY.YES && await Availability.exists({ period, user: target, date: { $in: dates }, status: AVAILABILITY.YES }))
      throw ApiError.forbidden('Hai già confermato la disponibilità: dopo il termine solo il titolare può toglierla.');

    if (!status) await Availability.deleteMany({ period, user: target, date: { $in: dates } });
    else await Availability.bulkWrite(dates.map(date => ({
      updateOne: { filter: { period, user: target, date }, update: { $set: { status, reason: status === AVAILABILITY.NO ? reason || '' : '' }, $unset: { unavailability: '' } }, upsert: true }
    })));
    if (override) await notif.notify([target], `Il titolare ha ${status ? 'modificato' : 'rimosso'} la tua risposta per ${dates.length === 1 ? dates[0] : `${dates.length} giorni`} (${p.title})`);
  }
};
