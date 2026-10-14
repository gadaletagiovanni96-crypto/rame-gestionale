import { useState } from 'react'; import { availabilityApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js';
import { MONTHS, WEEKDAYS, toYmd, todayYmd, formatDay } from '../../utils/date.js'; import Modal from '../ui/Modal.jsx'; import AvailabilityDayList from './AvailabilityDayList.jsx'; import ErrorText from '../ui/ErrorText.jsx';

const ICON = { disponibile: '✔', indisponibile: '✖', nessuna: '?' };
// Calendario di tutti. Mette insieme risposte dei periodi, indisponibilità libere e giorni scaduti senza risposta (= indisponibili).
// editable: solo titolare (toglie una disponibilità / fa passare un'indisponibilità a disponibilità)
export default function TeamAvailabilityCalendar({ editable = false }) {
  const now = new Date(); const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [person, setPerson] = useState(''); const [day, setDay] = useState(null); const [error, setError] = useState('');
  const from = toYmd(cur.y, cur.m, 1), last = new Date(cur.y, cur.m + 1, 0).getDate(), to = toYmd(cur.y, cur.m, last);
  const { data, reload } = useAsync(() => availabilityApi.calendar(from, to), [from, to], { users: [], days: {} });
  const offset = (new Date(cur.y, cur.m, 1).getDay() + 6) % 7, today = todayYmd();
  const move = n => { const d = new Date(cur.y, cur.m + n, 1); setCur({ y: d.getFullYear(), m: d.getMonth() }); };
  const act = async (userId, status) => { try { await availabilityApi.setDay({ user: userId, date: day, status }); setError(''); reload(); } catch (e) { setError(e.message); } };

  return <>
    <div className="row"><button className="ghost" aria-label="Mese precedente" onClick={() => move(-1)}>‹</button>
      <h2 className="grow" style={{ textAlign: 'center' }}>{MONTHS[cur.m]} {cur.y}</h2><button className="ghost" aria-label="Mese successivo" onClick={() => move(1)}>›</button></div>
    <select aria-label="Persona" value={person} onChange={e => setPerson(e.target.value)}><option value="">Tutte le persone (conteggio)</option>{data.users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select>
    <div className="legend"><span>✔ disponibili</span><span>✖ indisponibili</span><span>? da chiedere</span><span className="mute">Tocca un giorno per i dettagli</span></div>

    <div className="cal">
      {WEEKDAYS.map(d => <div className="h" key={d}>{d}</div>)}
      {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} className="day empty" />)}
      {Array.from({ length: last }, (_, i) => {
        const date = toYmd(cur.y, cur.m, i + 1), sts = data.days[date] || {}, list = Object.values(sts);
        const yes = list.filter(s => s.s === 'disponibile').length, no = list.filter(s => s.s === 'indisponibile').length, one = person ? sts[person] : null;
        return <button type="button" key={date} className={'day' + (date === today ? ' today' : '') + (one ? ' pstat-' + one.s : '')} aria-label={`${i + 1}: ${yes} disponibili, ${no} indisponibili`} onClick={() => { setError(''); setDay(date); }}>
          <span>{i + 1}</span>
          {person ? <span className="pstat">{ICON[one?.s || 'nessuna']}</span> : <span className="avc"><span className="y">✔{yes}</span><span className="n">✖{no}</span></span>}
        </button>;
      })}
    </div>

    {day && <Modal title={formatDay(day)} onClose={() => setDay(null)}>
      <p className="mute" style={{ marginTop: 0 }}>{editable ? "Puoi togliere una disponibilità o far passare un'indisponibilità a disponibilità. La persona viene avvisata." : 'Sola visualizzazione.'}</p>
      <ErrorText>{error}</ErrorText>
      <AvailabilityDayList users={data.users} statuses={data.days[day] || {}} person={person} editable={editable} onAct={act} />
    </Modal>}
  </>;
}
