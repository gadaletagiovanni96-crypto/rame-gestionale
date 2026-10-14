import { useState } from 'react'; import { periodsApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { useAuth } from '../context/AuthContext.jsx';
import { formatRange } from '../utils/date.js'; import Accordion from '../components/ui/Accordion.jsx'; import Modal from '../components/ui/Modal.jsx'; import ErrorText from '../components/ui/ErrorText.jsx'; import DeadlineBadge from '../components/availability/DeadlineBadge.jsx';
const BLANK = { title: '', from: '', to: '', deadline: '' };

// Gestione · periodi di disponibilità (qui si creano; ognuno risponde da "Il mio spazio → Disponibilità")
export default function PeriodsPage() {
  const { isOwner } = useAuth(); const { data: periods, reload, loading } = useAsync(periodsApi.list, [], []);
  const [form, setForm] = useState(BLANK); const [error, setError] = useState(''); const [editing, setEditing] = useState(null); const [deadline, setDeadline] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const act = async fn => { try { await fn(); setError(''); reload(); return true; } catch (e) { setError(e.message); return false; } };
  return <><h2>Periodi di disponibilità</h2>
    <Accordion title="➕ Nuovo periodo" defaultOpen={!loading && !periods.length}>
      <label htmlFor="pt">Titolo</label><input id="pt" placeholder="Es. Estate 2026" value={form.title} onChange={set('title')} />
      <h3 className="mt">Giorni da compilare</h3>
      <div className="pair"><div><label htmlFor="pf">Dal</label><input id="pf" type="date" value={form.from} onChange={set('from')} /></div><div><label htmlFor="pto">Al</label><input id="pto" type="date" min={form.from} value={form.to} onChange={set('to')} /></div></div>
      <h3 className="mt">Termine per comunicare le disponibilità</h3>
      <label htmlFor="pd">Ultimo giorno utile (incluso)</label><input id="pd" type="date" value={form.deadline} onChange={set('deadline')} />
      <p className="mute" style={{ margin: '6px 0' }}>Fino al termine ognuno può dare, togliere o cambiare le sue risposte. Scaduto il termine le disponibilità confermate non si toccano più (le cambia solo il titolare); le indisponibilità si possono sempre cambiare in disponibilità e chi non ha risposto vale come indisponibile.</p>
      <button className="y" disabled={!form.title || !form.from || !form.to || !form.deadline} onClick={async () => { if (await act(() => periodsApi.create(form))) setForm(BLANK); }}>Apri periodo</button>
    </Accordion>
    <ErrorText>{error}</ErrorText>
    {!loading && !periods.length && <p>Nessun periodo. Crea il primo: tutti riceveranno una notifica.</p>}
    {periods.map(p => <div className="card" key={p._id}>
      <h3>{p.title}</h3><div className="mute">{formatRange(p.from, p.to)}</div><div className="mt"><DeadlineBadge period={p} /></div>
      <div className="row mt">
        {(!p.closed || isOwner) && <button className="ghost sm" onClick={() => { setEditing(p); setDeadline(p.deadline || ''); }}>⏰ Modifica termine</button>}
        {(!p.closed || isOwner) && <button className="del sm" onClick={() => confirm('Eliminare il periodo e tutte le risposte?') && act(() => periodsApi.remove(p._id))}>Elimina</button>}
      </div></div>)}
    {editing && <Modal title={`Termine · ${editing.title}`} onClose={() => setEditing(null)} actions={<button className="y grow" disabled={!deadline} onClick={async () => { if (await act(() => periodsApi.setDeadline(editing._id, deadline))) setEditing(null); }}>Salva termine</button>}>
      <label htmlFor="nd">Ultimo giorno per rispondere</label><input id="nd" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></Modal>}
  </>;
}
