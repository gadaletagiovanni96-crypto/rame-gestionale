import { useState, useMemo } from 'react'; import { eventsApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { todayYmd, formatDay } from '../utils/date.js';
import { isConfirmed, leaderSeen, hasTeam } from '../utils/event.js';
import Accordion from '../components/ui/Accordion.jsx'; import TeamForm from '../components/events/TeamForm.jsx'; import MaterialForm from '../components/events/MaterialForm.jsx';

const ackOf = (event, id) => event.acks?.find(a => a.user === id);
const STATUS = [['all', 'Tutti'], ['todo', 'Da confermare'], ['done', 'Confermati ✅'], ['noteam', 'Senza squadra'], ['nomat', 'Materiale da sistemare']];
const PASS = { all: () => true, todo: e => !isConfirmed(e), done: isConfirmed, noteam: e => !hasTeam(e), nomat: e => !e.materialReady };
const people = e => [e.leader, ...e.animators].filter(Boolean);

function Member({ event, person, role }) {
  const a = ackOf(event, person._id);
  return <div className="crew"><span className="grow"><b>{person.name}</b>{role && <span className="mute"> · {role}</span>}</span>
    {a ? <span className="ack ok" title={new Date(a.at).toLocaleString('it-IT')}>✔ Visto</span> : <span className="ack wait">⏳ Da confermare</span>}</div>;
}
// Lista del materiale della squadra, sempre in vista; rosso se in quella giornata supera quello che c'è
function MaterialList({ event, usage }) {
  const items = event.materials.filter(m => m.material), pieces = items.reduce((n, m) => n + m.qty, 0);
  return <div className="matbox"><h4>📦 Materiale{pieces > 0 && ` · ${pieces} pezzi`}{event.materialReady && ' · ✔ sistemato'}</h4>
    {!items.length ? <p className="ask" style={{ margin: 0 }}>Nessun materiale assegnato</p> : items.map(m => { const used = usage[`${event.date}|${m.material._id}`] || 0, over = used > m.material.total;
      return <div className="item" key={m.material._id}><span className="grow"><b>{m.material.name}</b> <span className="mute">· {m.material.category}</span></span><b>×{m.qty}</b>
        {over && <small className="warn" style={{ flexBasis: '100%' }}>Materiale già usato interamente in quella giornata: richiesti {used}, disponibili {m.material.total}</small>}</div>; })}</div>;
}

export default function TeamsPage() {
  const [mode, setMode] = useState('upcoming'); const [d1, setD1] = useState(''); const [d2, setD2] = useState('');
  const range = mode === 'day' && d1 ? { from: d1, to: d1 } : mode === 'range' && d1 ? { from: d1, to: d2 || '2999-12-31' } : { from: todayYmd(), to: '2999-12-31' };
  const { data: events, reload, loading } = useAsync(() => eventsApi.list(range), [range.from, range.to], []);
  const [team, setTeam] = useState(null); const [material, setMaterial] = useState(null);
  const [status, setStatus] = useState('all'); const [text, setText] = useState(''); const [person, setPerson] = useState('');
  const everyone = useMemo(() => [...new Map(events.flatMap(people).map(p => [p._id, p.name])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [events]);
  const usage = useMemo(() => { const u = {}; events.forEach(e => e.materials.forEach(m => { if (m.material) u[`${e.date}|${m.material._id}`] = (u[`${e.date}|${m.material._id}`] || 0) + m.qty; })); return u; }, [events]);
  const q = text.trim().toLowerCase();
  const shown = events.filter(PASS[status]).filter(e => !person || people(e).some(p => p._id === person))
    .filter(e => !q || [e.title, e.location, ...people(e).map(p => p.name), ...e.guests].some(s => (s || '').toLowerCase().includes(q)));
  const days = [...new Set(shown.map(e => e.date))], filtering = status !== 'all' || q || person || mode !== 'upcoming';
  const done = () => { setTeam(null); setMaterial(null); reload(); };
  const reset = () => { setStatus('all'); setText(''); setPerson(''); setMode('upcoming'); setD1(''); setD2(''); };

  return <><h2>Squadre</h2>
    <p className="mute" style={{ marginTop: 0 }}>Un evento è confermato ✅ quando il materiale è sistemato e il responsabile ha dato la presa visione.</p>
    <div className="seg" role="group" aria-label="Quando">{[['upcoming', 'Da oggi'], ['day', 'Un giorno'], ['range', 'Periodo']].map(([k, l]) => <button key={k} className={mode === k ? 'on' : ''} onClick={() => setMode(k)}>{l}</button>)}</div>
    {mode === 'day' && <input type="date" aria-label="Giorno" value={d1} onChange={e => setD1(e.target.value)} />}
    {mode === 'range' && <div className="pair"><div><label htmlFor="d1">Dal</label><input id="d1" type="date" value={d1} onChange={e => setD1(e.target.value)} /></div>
      <div><label htmlFor="d2">Al</label><input id="d2" type="date" min={d1} value={d2} onChange={e => setD2(e.target.value)} /></div></div>}
    <input type="search" className="mt" placeholder="🔍 Cerca evento, luogo o persona…" aria-label="Cerca" value={text} onChange={e => setText(e.target.value)} />
    <div className="chips" role="group" aria-label="Filtra per stato">{STATUS.map(([k, l]) => <button key={k} className={'fchip' + (status === k ? ' on' : '')} onClick={() => setStatus(k)}>{l}</button>)}</div>
    <select aria-label="Filtra per persona" value={person} onChange={e => setPerson(e.target.value)}><option value="">Tutte le persone</option>{everyone.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>
    {filtering && <p className="mute">{shown.length} {shown.length === 1 ? 'evento' : 'eventi'} trovati · <button className="ghost sm" onClick={reset}>Azzera filtri</button></p>}
    {!loading && !days.length && <p>{filtering ? 'Nessun evento corrisponde ai filtri.' : 'Nessun impegno in programma: aggiungilo dal Calendario.'}</p>}

    {days.map((date, i) => { const list = shown.filter(e => e.date === date), ok = list.filter(isConfirmed).length;
      return <Accordion key={date} title={formatDay(date)} badge={`${ok}/${list.length} ✅`} defaultOpen={i === 0 || filtering}>
        {list.map(e => { const members = people(e).length, seen = people(e).filter(p => ackOf(e, p._id)).length, confirmed = isConfirmed(e);
          return <div className={'card' + (confirmed ? ' done' : '')} key={e._id} style={{ marginTop: 8 }}>
            <b>{confirmed && <span className="tick" title="Confermato">✅</span>}{e.start || 'Tutto il giorno'}{e.end && `–${e.end}`} · {e.title}</b>
            <div className="mute">📍 {e.location || 'Luogo da definire'}</div>
            <div className="steps">
              <span className={'ack ' + (e.materialReady ? 'ok' : 'wait')}>{e.materialReady ? '✔ Materiale sistemato' : '⏳ Materiale da sistemare'}</span>
              <span className={'ack ' + (leaderSeen(e) ? 'ok' : 'wait')}>{e.leader ? (leaderSeen(e) ? '✔ Responsabile ha visto' : '⏳ Responsabile da confermare') : '⏳ Manca il responsabile'}</span></div>
            <MaterialList event={e} usage={usage} />
            {members ? <>
              <div>{e.leader && <Member event={e} person={e.leader} role="Responsabile" />}{e.animators.map(a => <Member key={a._id} event={e} person={a} />)}
                {e.guests.map(g => <div className="crew" key={g}><span className="grow">{g}</span><span className="mute">ospite</span></div>)}</div>
              <p className={seen === members ? 'good' : 'ask'} style={{ margin: '6px 0' }}>Presa visione: {seen}/{members}</p>
            </> : <p className="warn">Squadra non assegnata</p>}
            <div className="row"><button className={members ? 'ghost sm' : 'y'} onClick={() => setTeam(e)}>{members ? 'Gestisci squadra' : 'Assegna squadra'}</button>
              <button className="ghost sm" onClick={() => setMaterial(e)}>📦 Modifica materiale</button></div>
          </div>; })}
      </Accordion>; })}
    {team && <TeamForm event={team} onClose={() => setTeam(null)} onSaved={done} />}
    {material && <MaterialForm event={material} onClose={() => setMaterial(null)} onSaved={done} />}
  </>;
}
