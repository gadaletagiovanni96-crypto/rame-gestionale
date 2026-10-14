import { useState } from 'react'; import { periodsApi, usersApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { useAuth } from '../context/AuthContext.jsx';
import { rangeDays, formatDay } from '../utils/date.js'; import ErrorText from '../components/ui/ErrorText.jsx'; import UnavailabilitySection from '../components/availability/UnavailabilitySection.jsx';
import PeriodChips from '../components/availability/PeriodChips.jsx'; import DeadlineBadge from '../components/availability/DeadlineBadge.jsx';
const DAY = { weekday: 'short', day: 'numeric', month: 'short' };

// Il mio spazio · solo risposte personali. I responsabili vedono anche chi è disponibile/indisponibile in ogni giorno (loro inclusi).
export default function AvailabilityPage() {
  const { user, isManager } = useAuth();
  const { data: periods } = useAsync(periodsApi.list, [], []);
  const [selected, setSelected] = useState(null); const [error, setError] = useState('');
  const period = periods.find(p => p._id === selected) || periods[0]; const pid = period?._id;
  const { data: entries, reload } = useAsync(() => pid ? periodsApi.availability(pid, isManager) : Promise.resolve([]), [pid, isManager], []);
  const { data: users } = useAsync(() => isManager ? usersApi.list() : Promise.resolve([]), [isManager], []);
  const days = period ? rangeDays(period.from, period.to) : [];
  const mine = date => entries.find(a => a.date === date && a.user._id === user.id);
  const answered = entries.filter(a => a.user._id === user.id).length;
  const call = async body => { try { await periodsApi.setAvailability({ period: pid, ...body }); setError(''); reload(); return true; } catch (e) { setError(e.message); return false; } };
  const toggle = (date, status) => call({ from: date, status: mine(date)?.status === status ? '' : status });
  const name = a => (a.user._id === user.id ? 'Tu' : a.user.name) + (a.reason ? ` (${a.reason})` : '');

  return <><h2>Disponibilità</h2>
    <UnavailabilitySection onChange={reload} />
    {!periods.length && <p>Nessun periodo aperto. Quando un responsabile ne apre uno, riceverai una notifica.</p>}
    <PeriodChips periods={periods} value={pid} onChange={id => { setSelected(id); setError(''); }} />
    <ErrorText>{error}</ErrorText>
    {period && <>
      <div className="row"><DeadlineBadge period={period} /><span className="mute">Hai risposto a {answered}/{days.length} giorni</span></div>
      {period.closed && <p className="ask">Termine scaduto: le disponibilità già confermate non si cambiano più (le modifica il titolare). Le indisponibilità puoi sempre cambiarle in disponibilità; i giorni senza risposta valgono come indisponibili.</p>}

      <div className={'avail-grid' + (isManager ? ' wide' : '')}>{days.map(d => {
        const m = mine(d), fromFree = Boolean(m?.unavailability), frozen = period.closed && m?.status === 'disponibile';   // dopo il termine si blocca solo la disponibilità confermata
        const yes = entries.filter(a => a.date === d && a.status === 'disponibile'), no = entries.filter(a => a.date === d && a.status === 'indisponibile');
        return <div key={d} className={`st ${m?.status || ''}`}>
          <b>{formatDay(d, DAY)}</b>{m?.reason && <small className="mute" style={{ display: 'block' }}>{m.reason}</small>}
          <div className="row mt">
            <button className={'sm ' + (m?.status === 'disponibile' ? '' : 'ghost')} disabled={frozen} onClick={() => toggle(d, 'disponibile')}>Disponibile</button>
            <button className={'sm ' + (m?.status === 'indisponibile' ? 'del' : 'ghost')} disabled={frozen || fromFree} onClick={() => toggle(d, 'indisponibile')}>No</button></div>
          {frozen && <small className="mute" style={{ display: 'block' }}>🔒 Disponibilità confermata</small>}
          {!frozen && fromFree && <small className="mute" style={{ display: 'block' }}>⛔ Dalle tue indisponibilità: eliminala da lì per toglierla (puoi segnarti disponibile)</small>}
          {period.closed && !m && <small className="warn" style={{ display: 'block' }}>Senza risposta = indisponibile</small>}
          {isManager && <div className="who-lists">
            <small className="good">✔ {yes.length ? yes.map(name).join(', ') : '—'}</small>
            <small className="warn">✖ {no.length ? no.map(name).join(', ') : '—'}</small>
            <small className={period.closed ? 'warn' : 'mute'}>{period.closed ? 'Senza risposta (valgono indisponibili)' : 'Senza risposta'}: {Math.max(users.length - yes.length - no.length, 0)}</small></div>}
        </div>; })}</div>
    </>}
  </>;
}
