import { eventsApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { useAuth } from '../context/AuthContext.jsx'; import { todayYmd, formatDay } from '../utils/date.js';
export default function MyProgramPage() {
  const { user } = useAuth();
  const { data: events, loading, reload } = useAsync(() => eventsApi.list({ mine: 1, from: todayYmd(), to: '2999-12-31' }), [], []);
  const confirmSeen = async id => { await eventsApi.ack(id); reload(); };
  const todo = events.filter(e => !e.acks.some(a => a.user === user.id)).length;
  return <><h2>Il mio programma</h2>
    {todo > 0 && <p className="ask">Hai {todo} {todo === 1 ? 'evento' : 'eventi'} da confermare.</p>}
    {!loading && !events.length && <p>Nessun evento in programma: quando ti assegneranno una festa la vedrai qui.</p>}
    {events.map(e => { const seen = e.acks.find(a => a.user === user.id);
      return <article className={'card' + (seen ? '' : ' todo')} key={e._id}>
        <h3>{formatDay(e.date)} · {e.title}</h3>
        <p style={{ margin: '4px 0' }}>🕒 {e.start || 'Tutto il giorno'}{e.end && `–${e.end}`} · 📍 {e.location || '—'}<br />Responsabile: <b>{e.leader?.name || '—'}</b></p>
        <p style={{ margin: '4px 0' }}>Squadra: {[...e.animators.map(a => a.name), ...e.guests].join(', ') || '—'}</p>
        {e.materials.length > 0 && <p style={{ margin: '4px 0' }}>Materiale: {e.materials.map(m => `${m.material?.name} ×${m.qty}`).join(', ')}</p>}
        {e.notes && <p style={{ margin: '4px 0' }}><i>{e.notes}</i></p>}
        {seen ? <span className="ack ok">✔ Presa visione il {new Date(seen.at).toLocaleDateString('it-IT')}</span> : <button className="y" style={{ width: '100%' }} onClick={() => confirmSeen(e._id)}>Presa visione</button>}
      </article>; })}</>;
}
