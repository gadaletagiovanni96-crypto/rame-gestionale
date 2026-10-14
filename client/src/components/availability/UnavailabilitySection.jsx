import { useState } from 'react'; import { unavailabilityApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js'; import { useAuth } from '../../context/AuthContext.jsx';
import { todayYmd, formatRange } from '../../utils/date.js'; import Accordion from '../ui/Accordion.jsx'; import ErrorText from '../ui/ErrorText.jsx';

// Le mie indisponibilità: un giorno o un periodo, sempre inseribili (anche senza periodi aperti).
// L'unico limite sono le disponibilità già confermate in un periodo scaduto.
export default function UnavailabilitySection({ onChange }) {
  const { user, isManager, isOwner } = useAuth(); const [all, setAll] = useState(false); const [form, setForm] = useState({ from: '', to: '', reason: '' }); const [error, setError] = useState('');
  const { data: items, reload } = useAsync(() => unavailabilityApi.list(all), [all], []);
  const run = async fn => { try { await fn(); setError(''); reload(); onChange?.(); return true; } catch (e) { setError(e.message); return false; } };
  const add = async () => { if (await run(() => unavailabilityApi.create({ from: form.from, to: form.to || form.from, reason: form.reason }))) setForm({ from: '', to: '', reason: '' }); };
  return <Accordion title="⛔ Le mie indisponibilità" badge={items.length || ''} defaultOpen>
    <p className="mute" style={{ margin: '0 0 4px' }}>Segna un giorno o un periodo in cui non puoi lavorare: vale sempre, anche fuori dai periodi di disponibilità. Non puoi invece cambiare i giorni in cui hai già confermato la disponibilità in un periodo scaduto.</p>
    <div className="pair">
      <div><label htmlFor="uf">Dal</label><input id="uf" type="date" min={todayYmd()} value={form.from} onChange={e => setForm({ ...form, from: e.target.value, to: form.to && form.to < e.target.value ? '' : form.to })} /></div>
      <div><label htmlFor="ut">Al (vuoto = solo quel giorno)</label><input id="ut" type="date" min={form.from || todayYmd()} value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} /></div></div>
    <label htmlFor="ur">Motivo (facoltativo)</label><input id="ur" maxLength={100} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Es. esame, vacanza" />
    <ErrorText>{error}</ErrorText>
    <div className="row mt"><button className="y" disabled={!form.from} onClick={add}>Segna indisponibile</button>
      {isManager && <button className="ghost" onClick={() => setAll(!all)}>{all ? 'Mostra solo le mie' : 'Vedi quelle di tutti'}</button>}</div>
    {items.length > 0 ? <div className="mt">{items.map(u => <div className="item" key={u._id}>
      <div className="grow"><b>{formatRange(u.from, u.to)}</b><small>{all && `${u.user.name}${u.reason ? ' · ' : ''}`}{u.reason}</small></div>
      {(u.user._id === user.id || isOwner) && <button className="del sm" aria-label="Elimina indisponibilità" onClick={() => run(() => unavailabilityApi.remove(u._id))}>🗑</button>}</div>)}</div>
      : <p className="mute">Nessuna indisponibilità in programma.</p>}
  </Accordion>;
}
