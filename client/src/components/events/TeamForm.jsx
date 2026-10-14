import { useState, useEffect } from 'react';
import { eventsApi, usersApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js'; import { formatDay } from '../../utils/date.js';
import Modal from '../ui/Modal.jsx'; import ErrorText from '../ui/ErrorText.jsx';

const EMPTY_BUSY = { animators: {}, materials: {}, availability: {}, notes: {} };
const idOf = x => x?._id || x || '';

// Stato di un animatore per quel giorno: impegni + disponibilità dichiarata
function Status({ id, busy }) {
  const events = busy.animators[id], a = busy.availability[id], note = busy.notes?.[id];
  return <>
    {events && <span className="warn">Già impegnato: {events.join(', ')}</span>}
    {a === 'indisponibile' ? <span className="warn">⛔ Indisponibile{note ? ` (${note})` : ''}</span> : a === 'disponibile' ? <span className="good">Disponibile</span> : <span className="ask">(chiedere disponibilità)</span>}
  </>;
}

export default function TeamForm({ event, onClose, onSaved }) {
  const [leader, setLeader] = useState(idOf(event.leader)); const [crew, setCrew] = useState((event.animators || []).map(idOf));
  const [guests, setGuests] = useState((event.guests || []).join(', ')); const [busy, setBusy] = useState(EMPTY_BUSY); const [error, setError] = useState('');
  const { data: users } = useAsync(usersApi.list, [], []);
  useEffect(() => { eventsApi.busy(event.date, event._id).then(setBusy).catch(() => setBusy(EMPTY_BUSY)); }, [event.date, event._id]);

  const off = id => busy.availability[id] === 'indisponibile';
  const offSelected = [leader, ...crew].filter(id => id && off(id)).length;
  const pickLeader = id => { setLeader(id); setCrew(c => c.filter(x => x !== id)); };   // il responsabile esce dalla lista animatori
  const toggle = (id, on) => setCrew(on ? [...crew, id] : crew.filter(x => x !== id));
  const save = async () => {
    try { await eventsApi.updateTeam(event._id, { leader, animators: crew, guests: guests.split(',').map(s => s.trim()).filter(Boolean) }); onSaved(); }
    catch (e) { setError(e.message); }
  };
  return <Modal title={`Squadra · ${event.title}`} onClose={onClose} actions={<button className="y grow" onClick={save}>Salva squadra</button>}>
    <p className="mute" style={{ margin: 0 }}>{formatDay(event.date)} · {event.start || 'tutto il giorno'}</p>
    <label htmlFor="leader">Responsabile di riferimento</label>
    <select id="leader" value={leader} onChange={e => pickLeader(e.target.value)}>
      <option value="">— scegli —</option>
      <optgroup label="Responsabili e titolari">{users.filter(u => u.role !== 'animatore').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</optgroup>
      <optgroup label="Animatori">{users.filter(u => u.role === 'animatore').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</optgroup>
    </select>
    {leader && <div className="row mt"><Status id={leader} busy={busy} /></div>}
    {offSelected > 0 && <p className="warn" role="alert">⚠ {offSelected} {offSelected === 1 ? 'persona selezionata è indisponibile' : 'persone selezionate sono indisponibili'} quel giorno.</p>}
    <label>Animatori</label>
    {users.filter(u => u._id !== leader).sort((a, b) => off(a._id) - off(b._id)).map(u => <label key={u._id} className={'pick' + (crew.includes(u._id) ? ' on' : '') + (off(u._id) ? ' off' : '')}>
      <input type="checkbox" checked={crew.includes(u._id)} onChange={e => toggle(u._id, e.target.checked)} />
      <span className="grow"><b>{u.name}</b><span><Status id={u._id} busy={busy} /></span></span></label>)}
    <label htmlFor="guests">Animatori solo per questo evento (separati da virgola)</label>
    <input id="guests" value={guests} onChange={e => setGuests(e.target.value)} placeholder="Es. Marco, Giulia" /><ErrorText>{error}</ErrorText>
  </Modal>;
}
